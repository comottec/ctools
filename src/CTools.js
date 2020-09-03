const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const ini = require('ini');
const { platform } = require('os');
const iconv = require("iconv-lite");

const argv = yargs
    .command("list")
    .command("start")
    .command("stop")
    .command("update")
    .option('ProtheusBin', {
          description: 'Pasta de binários do Protheus',
          alias: 'b',
          type: 'string'
    })
    .option("printEnv", {
      description: "Listar os Environments",
      alias: "pe",
      type: 'boolean'
    })
    .option("Environment", {
      description: "Procurar Appservers que tenha um Environment específico",
      alias: "e",
      type: 'string'
    })
    .option("SourcePath", {
      description: "Novo SourcePath para o comando update.",
      alias: "s",
      type: 'string'
    })
    .option("Port", {
      description: "Filtar Appserver da Porta especificada.",
      alias: "p",
      type: 'number'
    })
    /*.option("RpoFileName", {
      description: "Nome do arquivo de RPO.",
      alias: "r",
      type: 'string'
    })*/
    .version("1.00")
    .help()
    .alias('help', 'h')
    .argv;

const options = ["ProtheusBin", "printEnv", "Environment", "Port", "SourcePath"];
const listArgv = Object.keys(argv);
for (let i in listArgv) {  
  let opt = options.find((v,y) =>  v.toLowerCase() == listArgv[i].toLowerCase());
  if (opt) {    
    argv[opt] = argv[listArgv[i]];
  }
}

if (!argv._ || argv._.length == 0) {
  argv._ = ["list"];
}
if (!argv.ProtheusBin) {
  argv.ProtheusBin = process.env.ProtheusBin;
}
if (!argv.RpoFileName) {
  argv.RpoFileName = process.env.RpoFileName;
}
    
var ProtheusBin = argv.ProtheusBin;

if (!ProtheusBin) {
  console.log("O parametro --ProtheusBin ou -b não foi informado.");
  console.log("Obs: Se você preferir poderá criar a variavel de ambiente ProtheusBin, dessa forma o parametro não precisa ser informado.");
  return
}

if (!fs.existsSync(ProtheusBin)) {
  console.log(`Pasta ProtheusBin informada não existe. [${ProtheusBin}]`);
  return
}
argv.printEnv =  argv.Environment || argv.printEnv ? true : false;

var searchInDir = (dir, regExpr, done) => {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = path.resolve(dir, file);
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          searchInDir(file, regExpr, function(err, res) {
            results = results.concat(res);
            next();
          });
        } else {
          if (file.match(regExpr)) {
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};

const searchInDirAsync = (dirRoot, regExSearch) => new Promise( (resolve, reject) => {
  searchInDir(dirRoot, regExSearch,  (err, results) => {
    if (err) {
      reject(err);
    } else {
      resolve(results);
    }
  });
});

function getValue(object, key) {
  return Object.keys(object).find(k => k.toLowerCase() === key.toLowerCase());
}

const listApps = async (protheusBin = argv.ProtheusBin, printEnv = argv.printEnv, filterEnv = argv.Environment, filterPort = argv.Port) => {
  const serverLists = await searchInDirAsync(protheusBin, /(appserver.ini)$/);
  var servers = [];
  for (let i in serverLists) {
    fileIni = serverLists[i];
    let charCode = platform.ios == "win32" ? "windows-1252" : "utf-8";
    let appServerIni = ini.parse(fs.readFileSync(fileIni, charCode));
    const getV = (key1, key2) => { 
      let ret = getValue(appServerIni, key1);
      if (key2) {
        let tmp = getValue(appServerIni[ret], key2);
        ret = appServerIni[ret][tmp];
      }
      return ret;
    }
    const serverConfig = {
      masterSrv: false,
      brokerSrv: false,
      name: "",
      port: 0,
      service: "",
      status: "",
      envs: [],
      path: ""
    };
    if (getV("BALANCE_SMART_CLIENT_DESKTOP") || getV("BALANCE_WEB_SERVICES")) {
      serverConfig.brokerSrv = true;
      if (getV("BALANCE_SMART_CLIENT_DESKTOP", "LOCAL_SERVER_PORT")) {
         serverConfig.port = getV("BALANCE_SMART_CLIENT_DESKTOP", "LOCAL_SERVER_PORT");
         serverConfig.service = getV("BALANCE_SMART_CLIENT_DESKTOP", "SERVICE_NAME");
      }
      else {
        serverConfig.port = getV("BALANCE_WEB_SERVICES", "LOCAL_SERVER_PORT");
        serverConfig.service = getV("BALANCE_WEB_SERVICES", "SERVICE_NAME");
     }
    } else {
      if (getV("serverNetWork")) {
        serverConfig.masterSrv = true;
      }
      if (getV("tcp")) {
        serverConfig.port = parseInt(getV("tcp", "port"));
      }
      if (getV("service")) {
        serverConfig.service = getV("service", "name");
        serverConfig.status = await getServiceStatus(serverConfig.service);
      }      
    }

    if (filterPort) {
      if (filterPort != serverConfig.port) {
        continue;
      }
    }

    if (printEnv) {
      let sections = Object.keys(appServerIni);
       for (let i in sections) {
         let env = sections[i];
          if (getValue(appServerIni[env], "Sourcepath")) {
            if (!filterEnv || filterEnv.toLowerCase() == env.toLowerCase()) {
              serverConfig.envs.push(env);
            }
          }
       }
       
       if (filterEnv) {
         if (serverConfig.envs.length == 0) {
           continue;
         }
       }
    }

    serverConfig.name = "appserver";
    if (serverConfig.masterSrv) {
      serverConfig.name = "appserver (master)";
    } 
    if (serverConfig.brokerSrv) {
      serverConfig.name = "appserver (broker)";
    }

    serverConfig.path =  path.dirname(fileIni);

    servers.push(serverConfig);
  }

  return servers;
}

const _runCommand = (command, params, done, functionToRun) => {
  const proc = {
    cmd: command,
    args: params
  };

  var child = functionToRun ? functionToRun(proc.cmd, proc.args) : require("child_process").spawn(proc.cmd, proc.args);
  var result = "";
  var resultErr = "";

  child.stdout.on("data", (data) => {
      var output = typeof(data) === "string" ? data :  iconv.decode(data, "850")+"";
      result += output;
  });

  child.stderr.on("data", (error) => {
    var output = typeof(error) === "string" ? error :  iconv.decode(error, "850")+"";
    resultErr += output;
  });

  child.on("exit", data => {
    done(resultErr, result);
  });  
}

const runCommand = (command, params, functionToRun) => new Promise( (resolve, reject) => {
  _runCommand(command, params, (err, results) => {
    if (err) {
      reject(err);
    } else {
      resolve(results);
    }
  }, functionToRun);
})

const getServiceStatus = async (service) => {
  let result = await runCommand("sc", ["query", service]);
  result = result.replace("\r", "");
  let lines = result.split("\n");
  lines = lines.filter(el => el != null && el != "");
  if (lines.length < 3 ||
     lines[0].includes("EnumQueryServicesStatus:OpenService") && lines[0].includes("1060") ) {
    result = "NÃO INSTALADO"
  } else {
    result = lines[2];
    if (result.includes(":")) {
      result = result.split(":")[1];
      let code = result.trim().substring(0,1);
      /*
      1: STOPPED
      2: STOP PENDING
      3: START PENDING
      4: STARTED
      5: CONTINUE PENDING
      6: PAUSE PENDING
      7: PAUSED          
      */
      switch (code) {
        case  "1":
          result = "PARADO";
          break;      
        
        case "2":
          result = "INICIANDO";
          break

        case "3":
          result = "PARANDO";
          break;      
          
        case "4":
          result = "EM EXECUÇÃO";
          break

        case "5":
          result = "PENDENTE";
          break;      
            
        case "6":
          result = "PAUSANDO";
          break

        case "7":
          result = "PAUSADO";
          break
      }
    }
  }

  return result;
}

const runService = async (service, param) => {
  let result = await runCommand("sc", [param, service]);
  let err = null;
  result = result.replace("\r", "");
  let lines = result.split("\n");
  lines = lines.filter(el => el != null && el != "");
  if (lines.length < 1 ||
     (lines[0].includes("StartService") || lines[0].includes("OpenService"))
     && lines[0].includes(" 5:") ) {
    console.log("acesso negado: ", lines[0]);
    err = "Acesso negado";
  } else if (
    lines.length < 1 ||
     lines[0].includes("StartService") && lines[0].includes(" 1056:") ) {
    result = "EM EXECUÇÃO"
  } else if (
    lines.length < 1 ||
     lines[0].includes("ControlService") && lines[0].includes(" 1062:") ) {
    result = "PARADO"
  } else if (
    lines.length < 1 ||
     lines[0].includes("OpenService") && lines[0].includes(" 1060:") ) {
    result = "NÃO INSTALADO"
  } 
  else {
    try {
      result = await getServiceStatus(service);
    } catch (err) {
      console.log("err: ", err);
      result = err;
    }
  }

  return result;
}

const IsAdmin = async () => {
  try {
    //const ExecFun = await child_process.exec;
    const ExecFun = require("child_process").exec;
    const data = await runCommand("net file >NUL", {"env": null}, ExecFun);
    return true;
  } catch (err) {
    const msgErr = err & typeof(err) === "string" ? err.toLowerCase() : null;
    if (msgErr) {
      if (msgErr.includes("acesso negado") || msgErr.includes("access is denied")) {
        return false;
      }
    }
    console.log(err);
    return false;
  }
}

const printServices = (servers) => {
  let columns = ["name", "port", "service", "status"];
  if (argv.printEnv) {
    columns.push("envs")
  }
  columns.push("path");

  if (servers.length > 0) {
    console.table(servers, columns);
  } else {
    if (argv.Environment) {
      console.log(`Nenhum Appserver encontrado em ${ProtheusBin} para o ambiente ${argv.Environment}.`)
    } else {
      console.log(`Nenhum Appserver encontrado em ${ProtheusBin}.`)
    }
  }
}

const startServices = async () => {
  console.log("Iniciar serviços...")  
  if (!await IsAdmin()) {
    console.log("Para executar essa operação são necessários privilégios administrativos.")
    return;
  }

  const waitForStart = async (n) => {
    let error = false;
    let pending = false;
    if (n == 0) {
      process.stdout.write("Em processamento.");
    } else {
      process.stdout.write(".");
    }

    const servers = await listApps();
    const promises = servers.map(async (server) => {
      const srvStatus = {
        name: server.name,
        port: server.port,
        path: server.path,
        status: null
      };
      try {         
        srvStatus.status = await runService(server.service, "start");
        if (srvStatus.status == "INICIANDO" || srvStatus.status == "PENDENTE") {
          pending = true;
        }
      } catch (err) {
        srvStatus.status = `Erro (${err})`;
        if (err.toLowerCase() == "acesso negado") {
          error = true;
          console.log("Para rodar essa operação você precisa de privilégios administrativos.");
        }
      }    
    });
    
    await Promise.all(promises);
      
    if (!error && pending && n < 30) {
      const mySleep = () => new Promise( (resolve, reject) => {
        setTimeout(async () => {
            await waitForStart(n+1);
            resolve();
        }, 1000);

      });
      await mySleep();
    }
  }

  await waitForStart(0);
  process.stdout.write("\n");
  listApps().then(printServices);
};

const stopServices = async () => {
  console.log("Parando serviços...")  
  if (!await IsAdmin()) {
    console.log("Para executar essa operação são necessários privilégios administrativos.")
    return;
  }

  const waitForStopping = async (n) => {
    let error = false;
    let pending = false;
    if (n == 0) {
      process.stdout.write("Em processamento.");
    } else {
      process.stdout.write(".");
    }

    const servers = await listApps();
  
    const promises = servers.map(async (server) => {
      const srvStatus = {
        name: server.name,
        port: server.port,
        path: server.path,
        status: null
      };
      try {         
        srvStatus.status = await runService(server.service, "stop");
        if (srvStatus.status == "PARANDO" || srvStatus.status == "PENDENTE") {
          pending = true;
        }
      } catch (err) {
        srvStatus.status = `Erro (${err})`;
        if (err.toLowerCase() == "acesso negado") {
          error = true;
          console.log("Para rodar essa operação você precisa de privilégios administrativos.");
        }
      }    
    });
    
    await Promise.all(promises);
      
    if (!error && pending && n < 30) {
      const mySleep = () => new Promise( (resolve, reject) => {
        setTimeout(async () => {
            await waitForStopping(n+1);
            resolve();
        }, 1000);

      });
      await mySleep();
    }
  }

  await waitForStopping(0);
  process.stdout.write("\n");
  listApps().then(printServices);
};

const updateRPO = async (protheusBin = ProtheusBin, env = argv.Environment, sourcePath = argv.SourcePath, rpoFile = argv.RpoFileName) => {
  if (!env) {
    console.log("Parametro --Environment ou -e é obrigatório para update de RPO.");
    return
  }
  if (!sourcePath) {
    console.log("Parametro --SourcePath ou -s é obrigatório para update de RPO.");
    return
  }
  /*
  if (!rpoFile) {
    console.log("Parametro RpoFileName é obrigatório para update de RPO.");
    return
  }
  */

  const serverLists = await listApps(protheusBin, env);

  if (serverLists.length == 0) {
    console.log(`Nenhuma pasta com Appserver encontrado em ${ProtheusBin} com o ambiente: ${env}.`);
    return
  }

  if (!fs.existsSync(sourcePath)) {
    console.log(`Nova pasta ${sourcePath} para o SourcePath não existe.`);
    return
  }

  let rpoFullName = null;
  let list = [];

  for (let i in serverLists) {
    fileIni = path.join(serverLists[i].path, "appserver.ini");
    let charCode = platform.ios == "win32" ? "windows-1252" : "utf-8";
    let appServerIni = ini.parse(fs.readFileSync(fileIni, charCode));
    let envIni = Object.keys(appServerIni).find((x, i) => x.toLowerCase() == env.toLowerCase());
    let spIni = Object.keys(appServerIni[envIni]).find((x, i) => x.toLowerCase() == "sourcepath");
    let updated = false;

    if(!rpoFile) {
      let rpoDB = Object.keys(appServerIni[envIni]).find((x, i) => x.toLowerCase() == "rpodb");
      if (rpoDB) {
        switch (rpoDB.toUpperCase()) {
          case "CTREE": 
            rpoFile = "ttcp120.rpo";
            break;
          default:
            rpoFile = "tttp120.rpo";
            break;
        }  
      }
      if (!rpoFile) {
        console.log("Parametro --RpoFileName não identificado, exemplo: tttp120.rpo");
        return
      }    
    }
    if (!rpoFullName && rpoFile) {
      rpoFullName = path.join(sourcePath, rpoFile);
      if (!fs.existsSync(rpoFullName)) {
        console.log(`Arquivo de repositório ${rpoFullName} não encontrado.`);
        return
      }
    }
  
    if (path.join(appServerIni[envIni][spIni], rpoFile) !== path.join(sourcePath, rpoFile)) {
      appServerIni[envIni][spIni] = sourcePath;
      fs.writeFileSync(fileIni, ini.stringify(appServerIni));
      updated = true;
    }

    list.push({AppserverIni: fileIni, Status: updated ? "Atualizado" : "OK (não alterado)"});
  }

  console.log("SourcePath configurado para: ", sourcePath);
  console.table(list);
}

mainFunction = async () => {
  if (ProtheusBin) {
    if (argv._.length > 0) {
      console.log("Comottec Tools for ERP - versão 1.0.0");
      if (argv._.find((x) => x.toLowerCase() == "list")) {        
        console.log("Listar servidores...")
        listApps().then(printServices);
      } else if (argv._.find((x) => x.toLowerCase() == "start"))  {
        startServices();
      } else if (argv._.find((x) => x.toLowerCase() == "stop"))  {
        stopServices();
      } else if (argv._.find((x) => x.toLowerCase() == "update"))  {
        updateRPO();
      } else {
        console.log("comando inválido: ", argv._);
        yargs.showHelp();
      }
    } else {
      // console.log("Iniciando interface gráfica...")
      console.log("comando inválido: ", argv._);
      yargs.showHelp();
    }
  }  
}

mainFunction();


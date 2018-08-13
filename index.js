#!/usr/bin/env node
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
const path = require('path');
const fs = require('fs');
const pkg = require(path.resolve(__dirname, './package.json'));
const program = require('commander');

const cwd = process.cwd();

function versionConfigFile (dir) {
  const rcfilePath = path.join(dir, './.wkVersion.js');
  if(!fs.existsSync(rcfilePath)) {
    throw new Error(`在"${dir}"下 .wkVersion.js 配置文件不存在`);
  }
  return rcfilePath;
};

function checkConfig (config) {
  const base = config.base;

  if (!fs.existsSync(base)) {
    throw new Error(`base工程不存在，检查路径：${base}`);
  }
}

// 限定命令

program.version(pkg.version);

program.command('*')
.description('开发部署指令, test, dev, build')
.action((cmd, arg) => {
  console.log(`dev cwd:`, cwd);
  console.log(`dev cmd:`,cmd);

  const config = require(versionConfigFile(cwd));

  checkConfig(config);
  console.log(`base:`, config.base);

  const p = spawn('npm', `run ${cmd}`.split(' '), {
    cwd: config.base,
    env: {
      ...process.env,
      wkConfig: JSON.stringify(config),
    },
  }, (err, stdout, stderr) => {
    if (err) throw err;
    if (stdout) {
      console.log(`${stdout}`);
    }
    if (stderr) {
      console.log(`${stderr}`);
    }
  });
  p.stdout.on('data', (d) => {
    console.log(`${d}`);
  })
  p.stderr.on('data', (d) => {
    console.log(`${d}`);
  });
});

program.parse(process.argv);

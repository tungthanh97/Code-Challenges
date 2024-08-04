import { BackendServer } from './server';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { LoadBalancer } from './lb';

const getCommandArgs = async () => {
  try {
    const argv = await yargs(hideBin(process.argv))
      .option('lbport', {
        alias: 'l',
        type: 'number',
        description: 'Load balancer port',
        demandOption: true
      })
      .option('serverport', {
        alias: 's',
        type: 'array',
        description: 'List of server ports',
        demandOption: true
      })
      .coerce('serverport', (arg) => {
        if (Array.isArray(arg)) {
          return arg.map(Number);
        }
        return [];
      })
      .help()
      .alias('help', 'h')
      .parse();

    if (argv.serverport?.some((port) => isNaN(port))) {
      console.error('All server ports must be numbers.');
      process.exit(1);
    }

    const lbPort = argv.lbport;
    const servers = argv.serverport?.map((port) => new BackendServer(port));
    if (!servers || servers.length === 0) {
      console.error('No servers provided.');
      process.exit(1);
    }
    console.log(`servers: ${servers.map((server) => server.getServerUrl())}`);
    new LoadBalancer(
      lbPort,
      servers?.map((server) => server.getServerUrl())
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

getCommandArgs();

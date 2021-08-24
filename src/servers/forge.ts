import Fs from 'fs';
import Axios from 'axios';
import Path from 'path';
import OS from 'os';
import Child from 'child_process';
import Archiver from 'archiver';

class Forge {
    protected versions: string[];

    constructor() {
        if (!Fs.existsSync(Path.resolve('public', 'forge'))) {
            Fs.mkdirSync(Path.resolve('public', 'forge'));
        }

        this.versions = ['1.17.1'];
    }

    public update() {
        this.versions.map(version => {
            Axios.get('https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json')
                .then(response => {
                    const promos: any = response.data.promos;
                    const promo: any = Object.values(promos)[Object.keys(promos).findIndex(promo => promo.includes(`${version}-latest`))];

                    this.download(version, promo);
                });
        });
    }

    public download(version: string, promo: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Axios.get(`https://maven.minecraftforge.net/net/minecraftforge/forge/${version}-${promo}/forge-${version}-${promo}-installer.jar`, {
                responseType: 'stream',
            })
                .then(response => {
                    const dir = Fs.mkdtempSync(Path.join(OS.tmpdir(), 'forge-'));
                    const file = Fs.createWriteStream(Path.join(dir, `${version}.jar`));

                    console.log(dir);
                    
                    response.data.pipe(file);
                    response.data.on('end', () => {
                        const builder = Child.spawn('java', ['-jar', Path.resolve(dir, `${version}.jar`), '--installServer', Path.resolve(dir, version)]);

                        builder.stdout.on('data', (data) => {
                            console.log(data.toString());
                        });

                        builder.stderr.on('data', (data) => {
                            console.log(data.toString());
                        });

                        builder.on('close', (code) => {
                            if (code === 0) {
                                const zip = Fs.createWriteStream(Path.resolve('public', 'forge', `${version}.zip`));
                                const archive = Archiver('zip', {
                                    zlib: { 
                                        level: 9 
                                    },
                                });

                                zip.on('close', () => {
                                    console.log(`${version}.zip: ${archive.pointer()}`);
                                });

                                archive.pipe(zip);
                                archive.directory(Path.resolve(dir, version), false);
                                archive.finalize();
                            }
                        });
                    });
                });
        });
    }
};

export default Forge;
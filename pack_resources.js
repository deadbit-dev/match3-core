const fs = require('fs');
const path = require('path');
const decompress = require('decompress');
const archiver = require('archiver');
const { Command } = require('commander');


const config_path = "./resources.json";

function main() {
    load_config_async(on_config_loaded);
}

function load_config_async(on_loaded) {
    const program = new Command();
    program.command('run').argument('[string]', 'resource file').action((path) => {
        fs.readFile(path ? path : config_path, 'utf8', (err, data) => {
            if(err) throw err;
            on_loaded(JSON.parse(data));
        });
    });

    program.parse();
}

function on_config_loaded(config) {
    parse_resource_graph_async(config, loading_resources_from_source_zip);
}

function parse_resource_graph_async(config, on_parsed) {
    const graph_path = config.graph_path;
    fs.readFile(graph_path, 'utf8', (err, data) => {
        if(err) throw err;

        const resources = [];        
        const resources_graph = JSON.parse(data);
        for(const resource_path of config.resources) {
            const resource = { name: resource_path.match(/\/([^\/]+)\./)[1], hexes: [] };
            find_resource(resources_graph, resource_path, resource.hexes);
            resources.push(resource);
        }

        on_parsed(config, resources);
    });
}

function find_resource(resources_graph, resource_path, resources) {
    const resource_data = resources_graph.find((resource) => resource.path == resource_path);
    if(resource_data == undefined || resource_data.isInMainBundle) return;

    if(!resources.includes(resource_data.hexDigest)) {
        resources.push(resource_data.hexDigest);
    }
    
    for(const dependency of resource_data.children)
        find_resource(resources_graph, dependency, resources);
}

function loading_resources_from_source_zip(config, resources) {
    const source_zip = find_source_zip(config);
    decompress(source_zip).then((files) => {
        for(const resource of resources) {
            const path = config.build_path + '/' + resource.name + '.zip';
            const file = fs.createWriteStream(path);
            const zip = archiver('zip');
            zip.pipe(file);
            
            for(const hex of resource.hexes) {
                for(const file of files) {
                    if(file.path != hex) continue;
                    zip.append(file.data, {name: file.path});
                }
            }

            const manifest = 'liveupdate.game.dmanifest';
            for(const file of files) {
                if(file.path != manifest) continue;
                zip.append(file.data, {name: file.path});
            }
            
            zip.finalize();
        }
    });
}

function find_source_zip(config) {
    const files = fs.readdirSync(config.build_path);
    for(const filename of files) {
        const full_filename = path.join(config.build_path, filename);
        const stat = fs.lstatSync(full_filename);
        if(!stat.isDirectory() && filename.endsWith('.zip'))
            return full_filename;
    }
}

main();
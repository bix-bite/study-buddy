import { app } from 'electron';
import * as fs from 'fs';

interface IFileInfo {
  name: string;
  filePath: string;
  statusList: string[];
  data: Record<string, any>;
}

class SimpleElectronStore {
  userDataPath: string;

  files: IFileInfo[] = [];

  constructor() {
    this.userDataPath = app.getPath('userData'); // or path.resolve('.');
  }

  private lazyLoad(store: string): IFileInfo {
    let matchingFi = this.files.find((fi) => fi.name === store);
    let status = 'new';
    if (matchingFi === undefined) {
      let data: Record<string, any> = {};
      const path = `${this.userDataPath}/${store}.json`;
      try {
        // Try to read the file and parse it as JSON
        data = JSON.parse(fs.readFileSync(path, 'utf-8'));
        status = 'open';
      } catch (error) {
        // If file read or parse fails, start with an empty object
        data = {};
      }
      matchingFi = {
        name: store,
        filePath: path,
        data: data as Record<string, any>,
        statusList: [status],
      };
    }

    return matchingFi;
  }

  get<T>(store: string, key: string): any {
    const fi = this.lazyLoad(store);
    fi.statusList.push('get');
    fi.statusList.push(key);
    return fi.data[key] as T;
  }

  set(store: string, key: string, value: any): void {
    const fi = this.lazyLoad(store);
    fi.data[key] = value;
    fi.statusList.push('set');
    fi.statusList.push(key);
    SimpleElectronStore.save(fi);
  }

  delete(store: string, key: string): void {
    const fi = this.lazyLoad(store);
    delete fi.data[key];
    fi.statusList.push('delete');
    fi.statusList.push(key);
    SimpleElectronStore.save(fi);
  }

  // Save the current state to disk
  private static save(fi: IFileInfo): void {
    fs.writeFileSync(fi.filePath, JSON.stringify(fi.data, null, 2));
    fi.statusList.push('Saved');
    console.log(`${fi.filePath} [${fi.statusList.join('=>')}]`);
  }
}

export default SimpleElectronStore;

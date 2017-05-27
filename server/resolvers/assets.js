import s3 from 's3';
// import fs from 'fs';
import uuid from 'uuid';
import App from '../../app';
// TODO: Overhaul this file to use the file system
export const AssetsQueries = {
  asset(root, { assetKey, simulatorId = 'default' }) {
    const returnObj = App.assetObjects.find(obj => {
      return (obj.simulatorId === simulatorId && obj.fullPath === assetKey);
    });
    if (returnObj) {
      return { assetKey, url: returnObj.url };
    }
    return {};
  },
  assets(root, { assetKeys, simulatorId = 'default' }) {
    return assetKeys.map((key) => {
      const returnObj = App.assetObjects.find(obj => {
        return (obj.simulatorId === simulatorId && obj.fullPath === key);
      });
      if (returnObj) {
        return { assetKey: key, url: returnObj.url };
      }
      return {};
    });
  },
  assetFolders(root, { name, names }) {
    if (name) {
      return App.assetFolders.filter((f) => {
        return f.name === name;
      });
    }
    if (names) {
      return App.assetFolders.filter((f) => {
        return names.indexOf(f.name) > -1;
      });
    }
    return App.assetFolders;
  },
};

export const AssetsMutations = {
  addAssetFolder(root, { name, folderPath, fullPath }) {
    App.handleEvent({ name, folderPath, fullPath }, 'addAssetFolder');
    return '';
  },
  removeAssetFolder(root, { id }) {
    App.handleEvent({ id }, 'removeAssetFolder');
    return '';
  },
  addAssetContainer(root, { name, folderId, folderPath, fullPath }) {
    App.handleEvent({ name, folderId, folderPath, fullPath },
      'addAssetContainer');
    return '';
  },
  removeAssetContainer(root, { id }) {
    App.handleEvent({ id }, 'removeAssetContainer');
    return '';
  },
  removeAssetObject(root, { id }) {
    App.handleEvent({ id }, 'removeAssetObject');
    // Remove from S3 too.
    // Get the object
    // const obj = App.assetObjects.find((object) => object.id === id);
    // const extension = obj.url.substr(obj.url.lastIndexOf('.'));


    return '';
  },
  async uploadAsset(root, { files, simulatorId, containerId }) {
    const { folderPath, fullPath } = App.assetContainers
    .find(container => containerId === container.id);
    files.forEach((file) => {
      const extension = file.originalname.substr(file.originalname.lastIndexOf('.'));
      const key = `${fullPath.substr(1)}/${simulatorId + extension}`;


        // Add to the event store
        App.handleEvent({
          id: uuid.v4(),
          containerPath: folderPath,
          containerId,
          fullPath: `${fullPath}/${simulatorId + extension}`,
          url: s3.getPublicUrl('thorium-assets', key),
          simulatorId,
        }, 'addAssetObject');
      });
    return '';
  },
};

export const AssetsSubscriptions = {
  assetFolderChange(rootValue) {
    return rootValue;
  },
};


export const AssetsTypes = {
  AssetFolder: {
    containers(rootValue) {
      return App.assetContainers.filter((container) => {
        return container.folderId === rootValue.id;
      });
    },
  },
  AssetContainer: {
    objects(rootValue) {
      return App.assetObjects.filter((object) => {
        return object.containerId === rootValue.id;
      });
    },
  },
};

//-----------------------------------------------------------------------------
// BabGrass.js

  

  var Imported = Imported || {};
      Imported.JM_BabGrass = true;

  var JM = JM || {};
      JM.BabGrass = JM.BabGrass || {};
      JM.BabGrass.Version = 0.9;

/*:

*@author JankyMouse
*@plugindesc Generates 3D grass on a specific tile ID.
*@param ParticleDensity
*@text Particle Density
*@desc The default amount of rendered particles per tile.
*@parent Particles
*@type Number
*@decimals 0
*@min 0 @max 50
*@default 2

*@param GrassTileID
*@text Grass Tile ID
*@desc Open your console and type "mv3d.getTileId(x,y,0)" with the x and y being the coordinates of one of your grass tiles.
*@type Number
*@decimals 0
*@default 0000

*@param GrassTexture
*@text Grass Texture
*@desc Location of your grass texture. Format - "./img/MV3D/grass.png"
*@type Text


*/
  "use strict";
//------------------------------------------------------------------------------------
// PluginManager Parameters                                                    

  var JM_BabGrass = JM.BabGrass;
  JM_BabGrass.params = PluginManager.parameters("BabGrass");
  
  function safeParse(str) {
    let parsed;
  
    try {
      parsed = JSON.parse(str);
    } catch (error) {
      console.error(error);
    }
  
    return parsed;
  }

  JM_BabGrass.params = {
    ParticleDensity: Number(JM_BabGrass.params['ParticleDensity']),
    GrassTileID: Number(JM_BabGrass.params['GrassTileID']),
    GrassTexture: safeParse(JM_BabGrass.params['GrassTexture'])
  };
  //console.log(BaBabGrassrassParams['GrassTexture'])

//------------------------------------------------------------------------------------
// Tileset Position Notes 
  
  const mv3d_loadTilesetSettings = mv3d.loadTilesetSettings;
  mv3d.loadTilesetSettings = function(){
    mv3d_loadTilesetSettings.call(this);
    const grassTileNote = this.readConfigurationBlocks($gameMap.tileset().note,'BabGrass');
    if (grassTileNote){
      JM_BabGrass.grassTileNote = grassTileNote;
    }; 

  };

//------------------------------------------------------------------------------------
// Alias perform Transfer

const Scenetype_onMapLoaded = Scene_Map.prototype.onMapLoaded;
Scene_Map.prototype.onMapLoaded = function(){
// Run original of Transfer alias
  Scenetype_onMapLoaded.call(this);

//------------------------------------------------------------------------------------
// Cleanup for New Map Load

  if (JM_BabGrass.grassParticle != null){
    JM_BabGrass.grassParticle.dispose();
  };

//------------------------------------------------------------------------------------
// Tile Position Data

  const indices = [];
  const TileId = Number(JM_BabGrass.grassTileNote);
  //JM_BabGrass.indices = indices;
  //JM_BabGrass.params['GrassTileID'];
  let idx = $dataMap.data.indexOf(TileId);
  while (idx !== -1){
    indices.push(idx);
    idx = $dataMap.data.indexOf(TileId,idx + 1);
  };
   
  //console.log(indices)

  var MapIndex = indices.map(element => element),
      Ymath = indices.map(element => Math.trunc(element / $dataMap.height)),
      listxBase = [];

  for (var i = 0;i<=Ymath.length-1;i++)
      listxBase.push(MapIndex[i] - (Ymath[i] * $dataMap.width) - 0.5);

  let listyBase = indices.map(element => Math.trunc(element / $dataMap.height) * -1 - 0.5);

  var regionOffset = (($dataMap.height * $dataMap.width) * 6) - ($dataMap.height * $dataMap.width),
      asdf = indices.map(element => element + regionOffset),
      listzBase = [];
      //console.log(asdf);
  for (var i4 = 0;i4<=asdf.length-1;i4++)
      listzBase.push($dataMap.data[asdf[i4]]);

  function multiplyBase(arr, length){
  return Array.from({ length }, () => arr).flat();   
  };

  let listz = multiplyBase(listzBase, JM_BabGrass.params['ParticleDensity']);
  let listy = multiplyBase(listyBase, JM_BabGrass.params['ParticleDensity']);
  let listx = multiplyBase(listxBase, JM_BabGrass.params['ParticleDensity']); 
     

//console.log(listy);
//console.log(listx);
//console.log(listz);

//-------------------------------------------------------------------------------------
// Init Solid Particle System
 
  let i1 = 0;
  let i2 = 0;
  let i3 = 0;
    
  const scene = mv3d.scene;
  //scene.blockfreeActiveMeshesAndRenderingGroups = true;
  //this.ColorBlender = mv3d.ColorBlender;
  //this.Blender = mv3d.Blender;

  const SPS = new BABYLON.SolidParticleSystem("SPS", scene);
  const ParticleCount = listxBase.length * JM_BabGrass.params['ParticleDensity'];

  //var f = new BABYLON.Vector4(0.5,0, 1, 1); // front image = half the whole image along the width 
  var b = new BABYLON.Vector4(0,0, 0.5, 1); // back image = second half along the width 
  
  JM_BabGrass.poly = BABYLON.MeshBuilder.CreatePlane("p", {width: 0.01, height: 1,  sideOrientation: BABYLON.Mesh.DOUBLESIDE, frontUVs: b, backUVs: b }, scene);
    
  SPS.addShape(JM_BabGrass.poly, ParticleCount); // # of polys
  JM_BabGrass.poly.dispose(); // dispose of original model poly
  //mv3d.MeshGroup.addMesh();
  //scene.updateTransformMatrix();
  JM_BabGrass.grass = SPS.buildMesh(); // finally builds and displays the SPS mesh
  JM_BabGrass.grass.renderingGroupId = mv3d.enumRenderGroups.MAIN; // MV3D rendering layer fix

  //SPS.mesh.freezeWorldMatrix(); // prevents from re-computing the World Matrix each frame
  //SPS.mesh.freezeNormals(); // prevents from re-computing the normals each frame

  function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);

    };
   
  SPS.initParticles = () => {
    for (let p = 0; p < SPS.nbParticles; p++) {
          const particle = SPS.particles[p];
          particle.position.x =  ((listx[i1] * 100) + getRandomIntInclusive(0, 100)) / 100;
          i1++;
          particle.position.z = ((listy[i2] * 100) + getRandomIntInclusive(0, 100)) / 100;
          i2++;
          particle.position.y = ((listz[i3] * 100) + getRandomIntInclusive(-5,10)) / 100;
          i3++;
          particle.rotation.y = Math.random() * Math.PI;
          particle.rotation.z = getRandomIntInclusive(-2, 3) / 10;
          //particle.rotation.x = ((+.1 * 100) + getRandomIntInclusive(-10, 10)) / 100; 
      }
     
  };

  //old_mv3d_Character_getMeshesInRangeOfLight = mv3d.Character.getMeshesInRangeOfLight;
  //  mv3d.Character.getMeshesInRangeOfLight = function(){
  //  old_mv3d_Character_getMeshesInRangeOfLight.call(this);
  //  meshes.push(mv3d.grass);
  // }

  JM_BabGrass.grassParticle = SPS;
  //JM_BabGrass.grass = JM.BabGrass.grass;

//-------------------------------------------------------------------------------------
// Update SPS mesh

  SPS.initParticles();
  SPS.setParticles();
  
  //SPS.computeParticleTexture = false;
  //SPS.computeParticleColor = false;
  SPS.isAlwaysVisible = true;
  
  const material = new BABYLON.StandardMaterial("material", scene);
    //material.diffuseColor = new BABYLON.Color3(1,1,1);
    material.backFaceCulling = true;
    material.twoSidedLighting = true;
    material.alphaCutOff = mv3d.ALPHA_CUTOFF;
   // var mapLights = mv3d.scene.lights;
   // if (mapLights && mapLights.length > 0){
   // material.ambientColor = mapLights[0].diffuse;
   //};     
    material.ambientColor.set(0,1.5,0.5);
    material.specularColor.set(1,1,1);
    material.maxSimultaneousLights = 25;

  var texture = new BABYLON.Texture(JM_BabGrass.params['GrassTexture'], scene);  
      JM_BabGrass.grass.material = material;
      material.diffuseTexture = texture;
      //mv3d.meshes.convertToUnIndexedMesh();
      //mv3d.getMeshesInRangeOfLight(this.flashlight);
};





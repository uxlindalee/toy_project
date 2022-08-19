export class Tree {
  constructor(info) {
    this.x = info.x;
    this.y = info.y;
    this.z = info.z;
    this.scale = info.scale;

    info.gltfLoader.load(info.modelSrc, glb => {
      glb.scene.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });

      this.modelMesh = glb.scene.children[0];
      this.modelMesh.castShadow = true;
      this.modelMesh.position.set(this.x, this.y, this.z);
      this.modelMesh.scale.set(this.scale, this.scale, this.scale);
      info.scene.add(this.modelMesh);

      // this.setCannonBody();
    });
  }
  // setCannonBody() {
  //   const shape = new Box(new Vec3(this.width / 2, this.height / 2, this.depth / 2));
  //   this.cannonBody = new Body({
  //     mass: 1,
  //     position: new Vec3(this.x, this.y, this.z),
  //     shape,
  //   });

  //   this.cannonBody.quaternion.setFromAxisAngle(
  //     new Vec3(0, 1, 0), // y축
  //     this.rotationY
  //   );

  //   this.modelMesh.cannonBody = this.cannonBody;

  //   this.cannonWorld.addBody(this.cannonBody);
  // }
}

// export class Wind {
//   constructor(info) {
//     this.x = info.x;
//     this.y = info.y;
//     this.z = info.z;
//     this.scale = info.scale;

//     info.gltfLoader.load(info.modelSrc, glb => {
//       this.modelMesh = glb.scene.children[0];
//       this.modelMesh.castShadow = true;
//       this.modelMesh.position.set(this.x, this.y, this.z);
//       this.modelMesh.scale.set(this.scale, this.scale, this.scale);
//       info.scene.add(this.modelMesh);
//       this.actions[0] = this.mixer.clipAction(glb.animations[0]);
//       this.actions[0].play();
//     });
//   }
// }

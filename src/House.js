export class House {
	constructor(info) {
		this.x = info.x;
		this.y = info.y;
    this.z = info.z;
    // this.scale = info.scale;

		this.visible = false;

		info.gltfLoader.load(
			info.modelSrc,
			glb => {
				this.modelMesh = glb.scene.children[0];
				this.modelMesh.castShadow = true;
        this.modelMesh.position.set(this.x, this.y, this.z);
        // this.modelMesh.scale.set(this.scale, this.scale, this.scale);
				info.scene.add(this.modelMesh);
			}
		);
	}
}

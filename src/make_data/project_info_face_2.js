export const project_info = [
  {
    project_id: "c733ad20-63bf-4c00-b856-c018b0a9b094",
    info: {
      tracking_modes: {
        face: {
          tracks: [
            {
              scenes: [
                {
                  assets: [
                    {
                      src: "./assets_face_item/sparkar/headOccluder.glb",
                      src_thumbnail:
                        "./assets_face_item/sparkar/headOccluder.glb",
                      scale: [0.065, 0.065, 0.065],
                      asset_id: "asset_head_occluder",
                      position: [0, -0.3, 0.15],
                      rotation: [0, 0, 0],
                      asset_name: "headOccluder.glb",
                      anchorIndex: 168,
                      anchorPosition: "head",
                      mindar_face_occluder: true,
                    },
                    {
                      src: "./assets_face_item/hat/scene.gltf",
                      src_thumbnail: "./assets_face_item/hat/thumbnail.png",
                      scale: [0.5, 0.5, 0.5],
                      asset_id: "asset_hat1",
                      position: [0, 1.0, -0.5],
                      rotation: [0, 0, 0],
                      asset_name: "hat1",
                      anchorIndex: 10,
                      anchorPosition: "forehead",
                      visible: false,
                    },
                    {
                      src: "./assets_face_item/hat2/scene.gltf",
                      src_thumbnail: "./assets_face_item/hat2/thumbnail.png",
                      scale: [0.01, 0.01, 0.01],
                      asset_id: "asset_hat2",
                      position: [0, -0.22, -0.7],
                      rotation: [15, 0, 0],
                      asset_name: "hat2",
                      anchorIndex: 10,
                      anchorPosition: "forehead",
                      visible: true,
                    },
                    {
                      src: "./assets_face_item/glasses/scene.gltf",
                      src_thumbnail: "./assets_face_item/glasses/thumbnail.png",
                      scale: [0.009, 0.009, 0.009],
                      asset_id: "asset_glasses1",
                      position: [0, 0, -0.1],
                      rotation: [0, 0, 0],
                      asset_name: "glasses1",
                      anchorIndex: 168,
                      anchorPosition: "nose",
                      visible: false,
                    },
                    {
                      src: "./assets_face_item/glasses2/scene.gltf",
                      src_thumbnail:
                        "./assets_face_item/glasses2/thumbnail.png",
                      scale: [0.6, 0.6, 0.6],
                      asset_id: "asset_glasses2",
                      position: [0, -0.4, -0.25],
                      rotation: [0, -90, 0],
                      asset_name: "glasses2",
                      anchorIndex: 168,
                      anchorPosition: "nose",
                      visible: false,
                    },
                    {
                      src: "./assets_face_item/earring/scene.gltf",
                      src_thumbnail: "./assets_face_item/earring/thumbnail.png",
                      scale: [0.07, 0.07, 0.07],
                      asset_id: "asset_earring_left",
                      position: [-0.05, -0.4, -0.3],
                      rotation: [-0.1, -50, 0],
                      asset_name: "earring_left",
                      anchorIndex: 127,
                      anchorPosition: "left_ear",
                      visible: true,
                    },
                    {
                      src: "./assets_face_item/earring/scene.gltf",
                      src_thumbnail: "./assets_face_item/earring/thumbnail.png",
                      scale: [0.07, 0.07, 0.07],
                      asset_id: "asset_earring_right",
                      position: [0.05, -0.4, -0.3],
                      rotation: [0.1, 50, 0],
                      asset_name: "earring_right",
                      anchorIndex: 356,
                      anchorPosition: "right_ear",
                      visible: true,
                    },
                    {
                      src: "./assets/blue-beard-cartoon-character-3d-model/source/blue_beard.glb",
                      src_thumbnail:
                        "./assets/blue-beard-cartoon-character-3d-model/source/beard.jpg",
                      scale: [1.5, 1.5, 1.5],
                      asset_id: "asset_beard",
                      position: [0, -0.65, -1.3],
                      rotation: [0, 0, 0],
                      asset_name: "beard",
                      anchorIndex: 168,
                      anchorPosition: "mouth",
                      visible: true,
                    },
                  ],
                  scene_id: "S1",
                  scene_type: "face_item",
                },
                {
                  assets: [
                    {
                      src: "./assets_face_item/canonical_face_model_uv_visualization.png",
                      src_thumbnail:
                        "./assets_face_item/canonical_face_model_uv_visualization.png",
                      asset_id: "asset_2f97f79d-963f-47a1-9a67-85a61ce0789789",
                    },
                  ],
                  scene_id: "S2",
                  scene_type: "face_mesh",
                },
                {
                  assets: [
                    {
                      src: "https://assets.codepen.io/9177687/raccoon_head.glb",
                      src_thumbnail:
                        "./assets_face_item/canonical_face_model_uv_visualization.png",
                      asset_id: "asset_2f97f79d-963f-47a1-9a67-85a61ce0789797",
                      scale: [2, 2, 2],
                      position: [0, 0, 0],
                      rotation: [0, 0, 0],
                    },
                  ],
                  scene_id: "S3",
                  scene_type: "face_avatar",
                },
              ],
              track_id: "T1",
            },
          ],
          setting: {
            background: "./background_default.jpg",
            icon: "./icon_default.jpg",
            scene_button: {
              show: true,
              src_left:
                "./assets_face_item/left-arrow-arrow-3d-illustration-png.png",
              src_right:
                "./assets_face_item/right-arrow-arrow-3d-illustration-png.png",
            },
          },
        },
      },
    },
  },
];

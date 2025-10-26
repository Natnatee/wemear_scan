export const sampleProjects = [
  {
    project_id: "4dce27a0-486c-4d87-a0b7-7c6b66dd210e",
    workspace_id: "1",
    user_id: "1",
    image: "/card_project/example_1.jpg",
    name: "full project",
    label: "Designer",
    owner: "Alice",
    date: "15 May 25",
    status: "Published",
    tool: ["Image Tracking", "Face Tracking", "World Tracking"],
    link: "https://example.com/project1",
    info: {
      // ==========================================
      // ไม่มี shared_assets แล้ว!
      // ทุก asset อยู่กับ scene ที่ใช้เลย
      // ==========================================

      tracking_modes: {
        // ==========================================
        // 1. IMAGE TRACKING MODE
        // ==========================================
        image: {
          engine: "mindar-image",
          mindFile: {
            mind_id: "a7f排除6ae6e-9209-4b07-9c4e-a3a988213768",
            mind_name: "MindAR",
            mind_src:
              "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/final_2.mind",
            mind_image: {
              T1: "/target_image_mindfile/1.jpg",
              T2: "/target_image_mindfile/2.jpg",
              T3: "/target_image_mindfile/3.jpg",
              T4: "/target_image_mindfile/4.jpg",
            },
          },

          tracks: [
            {
              track_id: "T1",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [
                    {
                      asset_id: "000001",
                      src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
                      type: "Image",
                      scale: [0.2, 0.2, 0.2],
                      opacity: 1,
                      position: [0, 0, 0],
                      rotation: [0, 0, 0],
                    },
                  ],
                },
              ],
            },
            {
              track_id: "T2",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [
                    {
                      asset_id: "000002",
                      src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/flower.mp4",
                      type: "Video",
                      loop: true,
                      muted: true,
                      scale: [0.3, 0.3, 0.3],
                      autoplay: true,
                      position: [0, 0, 0],
                      rotation: [0, 0, 0],
                    },
                  ],
                },
              ],
            },
            {
              track_id: "T3",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [
                    {
                      asset_id: "000003",
                      src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/uploads_files_2882496_Shine+Sprite.gltf",
                      type: "3D Model",
                      scale: [0.1, 0.1, 0.1],
                      position: [0, 0, 0],
                      rotation: [0, 0, 0],
                    },
                  ],
                },
              ],
            },
            {
              track_id: "T4",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [
                    {
                      asset_id: "000004",
                      src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/uploads_files_2882496_Shine+Sprite.gltf",
                      type: "3D Model",
                      scale: [0.1, 0.1, 0.1],
                      position: [0.5, 0, 0],
                      rotation: [0, 0, 0],
                      action: {
                        event: "click",
                        type: "scene_transition",
                        target_track: "T4",
                        target_scene: "S2",
                      },
                    },
                    {
                      asset_id: "000005",
                      src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
                      type: "Image",
                      scale: [0.2, 0.2, 0.2],
                      opacity: 1,
                      position: [0, 0, 0],
                      rotation: [0, 0, 0],
                    },
                    {
                      asset_id: "000006",
                      src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/flower.mp4",
                      type: "Video",
                      loop: true,
                      muted: true,
                      scale: [0.3, 0.3, 0.3],
                      autoplay: true,
                      position: [-0.5, 0, 0],
                      rotation: [0, 0, 0],
                    },
                  ],
                },
                {
                  scene_id: "S2",
                  assets: [
                    {
                      asset_id: "000007",
                      src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/uploads_files_2882496_Shine+Sprite.gltf",
                      type: "3D Model",
                      scale: [0.1, 0.1, 0.1],
                      position: [0, 0, 0],
                      rotation: [0, 0, 0],
                      action: {
                        event: "click",
                        type: "scene_transition",
                        target_track: "T4",
                        target_scene: "S1",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },

        // ==========================================
        // 2. FACE TRACKING MODE
        // ==========================================
        face: {
          engine: "mindar-face",
          faceFile: { src: "https://example.com/assets/face-target.mind" },

          scenes: [
            {
              scene_id: "F1",
              assets: [
                {
                  asset_id: "000008",
                  src: "https://example.com/assets/glasses.gltf",
                  type: "3D Model",
                  position: [0, 0, 0],
                  scale: [0.5, 0.5, 0.5],
                },
                {
                  asset_id: "000009",
                  src: "https://example.com/assets/back_arrow.png",
                  type: "Image",
                  position: [0, -0.5, -0.5],
                  action: {
                    event: "click",
                    type: "mode_transition",
                    target_mode: "image",
                    target_track: "T2",
                    target_scene: "S1",
                  },
                },
              ],
            },
          ],
        },

        // ==========================================
        // 3. WORLD TRACKING MODE
        // ==========================================
        world: {
          engine: "webxr-ar",

          scenes: [
            {
              scene_id: "W1",
              assets: [
                {
                  asset_id: "000010",
                  src: "https://example.com/assets/world_statue.gltf",
                  type: "3D Model",
                  position: [0, -1, -3],
                },
                {
                  asset_id: "000011",
                  src: "https://example.com/assets/exit_world.png",
                  type: "Image",
                  position: [-0.5, 0.5, -2],
                  action: {
                    event: "click",
                    type: "engine_transition",
                    target_mode: "image",
                    target_track: "T2",
                    target_scene: "S1",
                  },
                },
              ],
            },
          ],
        },
      },
    },
  },
];

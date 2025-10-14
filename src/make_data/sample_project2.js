export const sampleProjects = [
  {
    project_id: "4dce27a0-486c-4d87-a0b7-7c6b66dd210e",
    workspace_id: "1",
    user_id: "1",
    image: "/card_project/example_1.jpg",
    name: "full project",
    label: "Designer",
    owner: "Alice",
    date: "15 May 25 ",
    status: "Published",
    tool: ["Image Tracking", "Face Tracking", "World Tracking"],
    link: "https://example.com/project1",
    info: {
      // ==========================================
      // 1. SHARED ASSETS (Asset Registry)
      // ใช้สำหรับเก็บ Source File หลัก และใช้ asset_name อ้างอิง
      // ==========================================
      shared_assets: [
        {
          asset_name: "IMAGE_TPL",
          asset_image: "/default_asset_image/image.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
          type: "Image",
        },
        {
          asset_name: "VIDEO_FLOWER",
          asset_image: "/default_asset_image/video.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/flower.mp4",
          type: "Video",
        },
        {
          asset_name: "MODEL_SHINE",
          asset_image: "/default_asset_image/model.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/uploads_files_2882496_Shine+Sprite.gltf",
          type: "3D Model",
        },
        {
          asset_name: "MODEL_GLASSES",
          asset_image: "/default_asset_image/model.png",
          src: "https://example.com/assets/glasses.gltf",
          type: "3D Model",
        },
        {
          asset_name: "ICON_BACK",
          asset_image: "/default_asset_image/image.png",
          src: "https://example.com/assets/back_arrow.png",
          type: "Image",
        },
        {
          asset_name: "MODEL_STATUE",
          asset_image: "/default_asset_image/model.png",
          src: "https://example.com/assets/world_statue.gltf",
          type: "3D Model",
        },
        {
          asset_name: "ICON_EXIT",
          asset_image: "/default_asset_image/image.png",
          src: "https://example.com/assets/exit_world.png",
          type: "Image",
        },
      ],

      tracking_modes: {
        // ==========================================
        // 2. IMAGE TRACKING MODE
        // ==========================================
        image: {
          engine: "mindar-image",
          mindFile: {
            src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/final_2.mind",
            image: {
              // Target Images สำหรับ Mind File ยังต้องใช้ src ดั้งเดิม
              T1: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T2: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T3: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T4: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
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
                      asset_name: "IMAGE_TPL", // ใช้ asset_name
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
                      asset_name: "VIDEO_FLOWER", // ใช้ asset_name
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
                      asset_name: "MODEL_SHINE", // ใช้ asset_name
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
                      asset_name: "MODEL_SHINE", // ใช้ asset_name
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
                      asset_name: "IMAGE_TPL", // ใช้ asset_name
                      scale: [0.2, 0.2, 0.2],
                      opacity: 1,
                      position: [0, 0, 0],
                      rotation: [0, 0, 0],
                    },
                    {
                      asset_id: "000006",
                      asset_name: "VIDEO_FLOWER", // ใช้ asset_name
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
                      asset_name: "MODEL_SHINE", // ใช้ asset_name
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
        // 3. FACE TRACKING MODE
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
                  asset_name: "MODEL_GLASSES", // ใช้ asset_name
                  position: [0, 0, 0],
                  scale: [0.5, 0.5, 0.5],
                },
                {
                  asset_id: "000009",
                  asset_name: "ICON_BACK", // ใช้ asset_name
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
        // 4. WORLD TRACKING MODE
        // ==========================================
        world: {
          engine: "webxr-ar",

          scenes: [
            {
              scene_id: "W1",
              assets: [
                {
                  asset_id: "000010",
                  asset_name: "MODEL_STATUE", // ใช้ asset_name
                  position: [0, -1, -3],
                },
                {
                  asset_id: "000011",
                  asset_name: "ICON_EXIT", // ใช้ asset_name
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
  {
    project_id: "4dce27a0-486c-4d87-a0b7-7c6b66dd210e",
    workspace_id: "1",
    user_id: "1",
    image: "/card_project/example_2.jpg",
    name: "Untitled project",
    label: "Designer legacy",
    owner: "Alice",
    date: "3 Mar 25 ",
    status: "Published",
    tool: [],
    link: "https://example.com/project2",
    info: {
      // ==========================================
      // 1. SHARED ASSETS (Asset Registry)
      // ใช้สำหรับเก็บ Source File หลัก และใช้ asset_name อ้างอิง
      // ==========================================
      shared_assets: [],

      tracking_modes: {},
    },
  },
  {
    project_id: "4dce27a0-486c-4d87-a0b7-7c6b66dd210e",
    workspace_id: "1",
    user_id: "1",
    image: "/card_project/example_3.jpg",
    name: "Image Tracking",
    label: "Designer legacy",
    owner: "John",
    date: "24 Dec 24",
    status: "Published",
    tool: ["Image Tracking"],
    link: "https://example.com/project3",
    info: {
      // ==========================================
      // 1. SHARED ASSETS (Asset Registry)
      // ใช้สำหรับเก็บ Source File หลัก และใช้ asset_name อ้างอิง
      // ==========================================
      shared_assets: [
        {
          asset_name: "IMAGE_TPL",
          asset_image: "/default_asset_image/image.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
          type: "Image",
        },
        {
          asset_name: "VIDEO_FLOWER",
          asset_image: "/default_asset_image/video.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/flower.mp4",
          type: "Video",
        },
        {
          asset_name: "MODEL_SHINE",
          asset_image: "/default_asset_image/model.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/uploads_files_2882496_Shine+Sprite.gltf",
          type: "3D Model",
        },
        {
          asset_name: "MODEL_GLASSES",
          asset_image: "/default_asset_image/model.png",
          src: "https://example.com/assets/glasses.gltf",
          type: "3D Model",
        },
        {
          asset_name: "ICON_BACK",
          asset_image: "/default_asset_image/image.png",
          src: "https://example.com/assets/back_arrow.png",
          type: "Image",
        },
        {
          asset_name: "MODEL_STATUE",
          asset_image: "/default_asset_image/model.png",
          src: "https://example.com/assets/world_statue.gltf",
          type: "3D Model",
        },
        {
          asset_name: "ICON_EXIT",
          asset_image: "/default_asset_image/image.png",
          src: "https://example.com/assets/exit_world.png",
          type: "Image",
        },
      ],

      tracking_modes: {
        // ==========================================
        // 2. IMAGE TRACKING MODE
        // ==========================================
        image: {
          engine: "mindar-image",
          mindFile: {
            src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/final_2.mind",
            image: {
              // Target Images สำหรับ Mind File ยังต้องใช้ src ดั้งเดิม
              T1: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T2: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T3: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T4: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
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
                      asset_name: "IMAGE_TPL", // ใช้ asset_name
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
                      asset_name: "VIDEO_FLOWER", // ใช้ asset_name
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
                      asset_name: "MODEL_SHINE", // ใช้ asset_name
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
                      asset_name: "MODEL_SHINE", // ใช้ asset_name
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
                      asset_name: "IMAGE_TPL", // ใช้ asset_name
                      scale: [0.2, 0.2, 0.2],
                      opacity: 1,
                      position: [0, 0, 0],
                      rotation: [0, 0, 0],
                    },
                    {
                      asset_id: "000006",
                      asset_name: "VIDEO_FLOWER", // ใช้ asset_name
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
                      asset_name: "MODEL_SHINE", // ใช้ asset_name
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
      },
    },
  },
  {
    project_id: "4dce27a0-486c-4d87-a0b7-7c6b66dd210e",
    workspace_id: "1",
    user_id: "1",
    image: "/card_project/example_4.jpg",
    name: "Face Tracking",
    label: "Designer legacy",
    owner: "Tony",
    date: "2 Nov 24",
    status: "Unpublished",
    tool: ["Face Tracking"],
    link: "https://example.com/project4",
    info: {
      // ==========================================
      // 1. SHARED ASSETS (Asset Registry)
      // ใช้สำหรับเก็บ Source File หลัก และใช้ asset_name อ้างอิง
      // ==========================================
      shared_assets: [
        {
          asset_name: "IMAGE_TPL",
          asset_image: "/default_asset_image/image.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
          type: "Image",
        },
        {
          asset_name: "VIDEO_FLOWER",
          asset_image: "/default_asset_image/video.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/flower.mp4",
          type: "Video",
        },
        {
          asset_name: "MODEL_SHINE",
          asset_image: "/default_asset_image/model.png",
          src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/uploads_files_2882496_Shine+Sprite.gltf",
          type: "3D Model",
        },
        {
          asset_name: "MODEL_GLASSES",
          asset_image: "/default_asset_image/model.png",
          src: "https://example.com/assets/glasses.gltf",
          type: "3D Model",
        },
        {
          asset_name: "ICON_BACK",
          asset_image: "/default_asset_image/image.png",
          src: "https://example.com/assets/back_arrow.png",
          type: "Image",
        },
        {
          asset_name: "MODEL_STATUE",
          asset_image: "/default_asset_image/model.png",
          src: "https://example.com/assets/world_statue.gltf",
          type: "3D Model",
        },
        {
          asset_name: "ICON_EXIT",
          asset_image: "/default_asset_image/image.png",
          src: "https://example.com/assets/exit_world.png",
          type: "Image",
        },
      ],

      tracking_modes: {
        // ==========================================
        // 3. FACE TRACKING MODE
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
                  asset_name: "MODEL_GLASSES", // ใช้ asset_name
                  position: [0, 0, 0],
                  scale: [0.5, 0.5, 0.5],
                },
                {
                  asset_id: "000009",
                  asset_name: "ICON_BACK", // ใช้ asset_name
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
      },
    },
  },
  {
    project_id: "4dce27a0-486c-4d87-a0b7-7c6b66dd210e",
    workspace_id: "1",
    user_id: "1",
    image: "/card_project/example_5.jpg",
    name: "world tracking + none",
    label: "Designer",
    owner: "Sarah",
    date: "12 Oct 24",
    status: "Published",
    tool: ["World Tracking"],
    link: "https://example.com/project5",
    info: {
      // ==========================================
      // 1. SHARED ASSETS (Asset Registry)
      // ใช้สำหรับเก็บ Source File หลัก และใช้ asset_name อ้างอิง
      // ==========================================
      shared_assets: [],

      tracking_modes: {
        // ==========================================
        // 4. WORLD TRACKING MODE
        // ==========================================
        world: {
          engine: "webxr-ar",
          scenes: [
            {
              scene_id: "W1",
              assets: [],
            },
          ],
        },
      },
    },
  },
  {
    project_id: "4dce27a0-486c-4d87-a0b7-7c6b66dd210e",
    workspace_id: "1",
    user_id: "1",
    image: "/card_project/example_6.jpg",
    name: "3tool + mindfile",
    label: "Designer legacy",
    owner: "David",
    date: "20 Sep 24",
    status: "Unpublished",
    tool: ["Image Tracking", "Face Tracking", "World Tracking"],
    link: "https://example.com/project6",
    info: {
      // ==========================================
      // 1. SHARED ASSETS (Asset Registry)
      // ใช้สำหรับเก็บ Source File หลัก และใช้ asset_name อ้างอิง
      // ==========================================
      shared_assets: [],

      tracking_modes: {
        // ==========================================
        // 2. IMAGE TRACKING MODE
        // ==========================================
        image: {
          engine: "mindar-image",
          mindFile: {
            src: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/assets/final_2.mind",
            image: {
              // Target Images สำหรับ Mind File ยังต้องใช้ src ดั้งเดิม
              T1: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T2: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T3: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
              T4: "https://msdwbkeszkklbelimvaw.supabase.co/storage/v1/object/public/assets/AS0101_pamh6b.jpg",
            },
          },

          tracks: [
            {
              track_id: "T1",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [],
                },
              ],
            },
            {
              track_id: "T2",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [],
                },
              ],
            },
            {
              track_id: "T3",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [],
                },
              ],
            },
            {
              track_id: "T4",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [],
                },
              ],
            },
          ],
        },

        // ==========================================
        // 3. FACE TRACKING MODE
        // ==========================================
        face: {
          engine: "mindar-face",
          faceFile: { src: "" },

          scenes: [
            {
              scene_id: "F1",
              assets: [],
            },
          ],
        },

        // ==========================================
        // 4. WORLD TRACKING MODE
        // ==========================================
        world: {
          engine: "webxr-ar",
          scenes: [
            {
              scene_id: "W1",
              assets: [],
            },
          ],
        },
      },
    },
  },
  {
    project_id: "4dce27a0-486c-4d87-a0b7-7c6b66dd210e",
    workspace_id: "1",
    user_id: "1",
    image: "/card_project/example_7.jpg",
    name: "3 tool none",
    label: "Designer legacy",
    owner: "Emily",
    date: "18 Sep 24",
    status: "Unpublished",
    tool: ["Image Tracking", "Face Tracking", "World Tracking"],
    link: "https://example.com/project7",
    info: {
      // ==========================================
      // 1. SHARED ASSETS (Asset Registry)
      // ใช้สำหรับเก็บ Source File หลัก และใช้ asset_name อ้างอิง
      // ==========================================
      shared_assets: [],

      tracking_modes: {
        // ==========================================
        // 2. IMAGE TRACKING MODE
        // ==========================================
        image: {
          engine: "mindar-image",
          mindFile: {
            src: "",
            image: {},
          },

          tracks: [
            {
              track_id: "T1",
              scenes: [
                {
                  scene_id: "S1",
                  assets: [],
                },
              ],
            },
          ],
        },

        // ==========================================
        // 3. FACE TRACKING MODE
        // ==========================================
        face: {
          engine: "mindar-face",
          faceFile: { src: "" },

          scenes: [
            {
              scene_id: "F1",
              assets: [],
            },
          ],
        },

        // ==========================================
        // 4. WORLD TRACKING MODE
        // ==========================================
        world: {
          engine: "webxr-ar",
          scenes: [
            {
              scene_id: "W1",
              assets: [],
            },
          ],
        },
      },
    },
  },
];

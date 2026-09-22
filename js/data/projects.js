// Generated from content/projects/*.json by content/tools/gen_site_data.py. Do not edit by hand.

// Every media src, poster and thumb below is a file in media/, written by
// content/tools/build_media.py and resolved through MEDIA_BASE.
export const MEDIA_BASE = "media/";

export const PROJECTS = [
  // AI/ML
  {
    id: "antiangler",
    name: "AntiAngler",
    areas: ["ai"],
    tier: 1,
    blurb: "Finds vessels fishing illegally inside marine reserves, sweeping 1,799 protected areas nightly.",
    desc: "AntiAngler is a pipeline that spots vessels fishing illegally inside strictly protected marine reserves. I trained two vessel detectors from scratch, one on Sentinel-2 optical imagery and one on Sentinel-1 SAR radar, taking held-out recall from 0.08 to 0.77 with 0.94 precision on dense anchorages, using a human-in-the-loop labeling tool I built to drive an active-learning loop. A nightly job fuses the detections with AIS and Global Fishing Watch data, sweeps all 1,799 strictly protected areas worldwide, and reports named, flagged vessels caught fishing inside them. The whole thing runs in CI on a $0 budget, with 355 offline tests guarding it.",
    tags: [
      "Python",
      "PyTorch",
      "YOLOv8",
      "FastAPI",
      "rasterio / GeoPandas",
      "Sentinel-1/2",
      "Global Fishing Watch",
      "GitHub Actions"
    ],
    order: { ai: 2 },
    links: [
      {
        kind: "repo",
        label: "View on GitHub",
        url: "https://github.com/gjGameJam/AntiAngler",
        primary: true
      }
    ],
    media: {
      videos: [
        {
          src: "repo/antiangler_review_demo.mp4",
          width: 1906,
          height: 944,
          caption: "The review tool that drives the active-learning loop: judging the detector's boxes chip by chip"
        }
      ],
      images: [
        {
          src: "home/a01baa_0110865dfbfc45199dd83a9b8072bdb1.webp",
          width: 1920,
          height: 1832,
          caption: "Detections on Sentinel tiles"
        },
        {
          src: "home/a01baa_ded723d1e73e489f9590423505e477c7.webp",
          width: 2719,
          height: 1334,
          caption: "What each confidence threshold buys"
        },
        {
          src: "home/a01baa_aeb5b090f1a946d585fbf7d69c48607d.webp",
          width: 1415,
          height: 723,
          caption: "The 1,799 strictly protected areas swept nightly"
        }
      ]
    },
    thumb: "thumbs/antiangler.webp",
    year: 2026
  },
  {
    id: "folded",
    name: "Folded",
    areas: ["ai", "games"],
    tier: 1,
    blurb: "A genetic algorithm folds and throws paper gliders in simulation, evolving them for distance.",
    desc: "Folded evolves paper gliders. A genetic algorithm maps genes to each sheet's characteristics and scores fitness by the distance a glider travels, a folding algorithm turns those characteristics into glider geometry by generating triangle meshes for every obtainable paper configuration, and an aerodynamics simulation assuming laminar flow throws them. I built it in Unity after wondering why evolution is so rarely run inside environments modeled on real physics, where it could expose misconceptions in how aerodynamics is taught. Rectangular wings are the next step, and they need heavier math than the dart configurations it folds today. Gliders are mean green machines too: about as eco-friendly as aircraft get, no fuel, nothing but nature keeping them up.",
    tags: ["C#", "Unity", "Genetic algorithm", "Aerodynamics sim", "Procedural meshes"],
    order: { ai: 1, games: 1 },
    links: [
      {
        kind: "play",
        label: "Play Folded",
        url: "https://gjgamejam.itch.io/folded",
        primary: true
      },
      { kind: "repo", label: "View on GitHub", url: "https://github.com/gjGameJam/FoldeD" }
    ],
    media: {
      images: [
        {
          src: "home/folded_whiteboard_web.webp",
          width: 1600,
          height: 1042,
          caption: "The glider's lift and drag forces, worked out on a whiteboard"
        }
      ]
    },
    thumb: "thumbs/folded.webp"
  },
  {
    id: "laigo",
    name: "LAIGO Mosaic Maker",
    areas: ["ai"],
    tier: 1,
    blurb: "Turn any image into a buildable LEGO mosaic, with a parts list and step-by-step instructions.",
    desc: "LAIGO is a web app that turns any image into a buildable LEGO mosaic. A Python/FastAPI pipeline chains image segmentation, color quantization, and mosaic layout synthesis, then procedurally generates the parts list and step-by-step build instructions. I loved LEGO as a kid, so it was a natural first product for my AI/ML work. The React front end previews the mosaic in interactive 3D and sells the $1.99 build pack through Stripe, and a nightly C# test suite on GitHub Actions guards against regressions.",
    tags: [
      "Python",
      "FastAPI",
      "React",
      "TypeScript",
      "Three.js",
      "Stripe",
      "C# / .NET tests",
      "GitHub Actions"
    ],
    order: { ai: 3 },
    links: [
      {
        kind: "live",
        label: "Try LAIGO",
        url: "https://laigo-frontend.onrender.com/",
        primary: true
      },
      { kind: "repo", label: "Backend", url: "https://github.com/gjGameJam/LAIGO" },
      { kind: "repo", label: "Frontend", url: "https://github.com/gjGameJam/LAIGO-Frontend" },
      { kind: "repo", label: "Test suite", url: "https://github.com/gjGameJam/AutomationLaigo" }
    ],
    media: {
      videos: [
        {
          src: "repo/laigo_demo.mp4",
          width: 1916,
          height: 988,
          caption: "The app end to end: a photo becomes a mosaic, previewed in 3D, with the build pack at checkout",
          poster: "repo/laigo_demo_poster.webp"
        }
      ],
      images: [
        {
          src: "repo/laigo_instructions.webp",
          width: 296,
          height: 391,
          caption: "A page of the generated build instructions: attaching the hanging brackets with the black pins"
        }
      ]
    },
    thumb: "thumbs/laigo.webp",
    year: 2026
  },
  {
    id: "astar",
    name: "A* Pathfinding",
    areas: ["ai"],
    tier: 3,
    blurb: "A* in two settings: threading a spiral maze, and a chip hunt gated by keys and doors.",
    desc: "Two agents built on A*. The first traverses two-dimensional spaces optimally toward a target position, shown here threading a spiral maze. The second plays a Chip's Challenge-style level, replanning as it goes to work out which route collects every chip without stranding itself behind a key and door combination. I had already tinkered with Unity's A* package on an earlier game project, so writing the search myself was what made the algorithm click.",
    tags: ["Java", "A* search", "Heuristic pathfinding", "Replanning"],
    order: { ai: 8 },
    media: {
      videos: [
        {
          src: "home/a01baa_d6db0438736a4e479709c7bfe32253c2.mp4",
          width: 1080,
          height: 1080,
          caption: "Spiral maze"
        },
        {
          src: "home/a01baa_8809dd814130420889af3514ac82ac6d.mp4",
          width: 1920,
          height: 1080,
          caption: "Collecting chips past keys and doors"
        }
      ]
    }
  },
  {
    id: "quant",
    name: "Color Quantization",
    areas: ["ai"],
    tier: 3,
    blurb: "K-means color quantization: most images survive on about 20 colors. The precursor to LAIGO.",
    desc: "A K-means experiment in unsupervised learning: cluster an image's pixels in color space, then repaint it using only the cluster centers. Running the same photo from 1 color up to 128 shows how fast it converges, and by roughly 20 colors most images look essentially intact. It was my way into unsupervised learning, and the quantization step went on to become part of LAIGO's mosaic pipeline.",
    tags: ["Python", "NumPy", "Pillow", "scikit-learn", "K-means", "Unsupervised learning"],
    order: { ai: 11 },
    links: [
      {
        kind: "repo",
        label: "View on GitHub",
        url: "https://github.com/gjGameJam/LAIGO/blob/main/scripts/colorQuant.py",
        primary: true
      }
    ],
    media: {
      images: [
        {
          src: "home/a01baa_14926a63152c4c2eafdfff67c08548b9.webp",
          width: 474,
          height: 355,
          caption: "Original"
        },
        {
          src: "home/a01baa_dfef5dc9eaea47f7b2e45861a160d427.webp",
          width: 474,
          height: 355,
          caption: "2 colors"
        },
        {
          src: "home/a01baa_b0a89a5c25da4b5d969dbd2e14978f39.webp",
          width: 474,
          height: 355,
          caption: "8 colors"
        },
        {
          src: "home/a01baa_ef14523dab8840df830d32f85bb6e500.webp",
          width: 474,
          height: 355,
          caption: "32 colors"
        }
      ]
    },
    thumb: "thumbs/quant.webp"
  },
  {
    id: "connect4",
    name: "Connect Four Agent",
    areas: ["ai"],
    tier: 3,
    blurb: "A minimax agent with alpha-beta pruning, playing Connect Four against another agent.",
    desc: "A Connect Four agent that searches with minimax and alpha-beta pruning, assuming the opponent takes whatever move is best for them and skipping branches that cannot change the outcome. It searches all the way down, with pruning keeping that tractable, and scores positions with an evaluation function I wrote myself. In the video two agents play each other on the course framework, one yellow and one red. It was my favorite of the algorithms from that class, and I still think pointing something similar at a turn-based RPG like Baldur's Gate 3 would be interesting.",
    tags: ["Java", "Minimax", "Alpha-beta pruning", "Adversarial search"],
    order: { ai: 10 },
    media: {
      videos: [
        { src: "home/a01baa_a63ba7b58f944f2686f0ca9c8f7e299b.mp4", width: 1080, height: 1080 }
      ]
    }
  },
  {
    id: "emotion",
    name: "FaceFigurer",
    areas: ["ai"],
    tier: 3,
    blurb: "Real-time face detection and eight-way emotion classification, light enough for AR glasses.",
    desc: "A real-time webcam pipeline that finds faces and reads their expressions. A YOLOv8-nano face detector feeds an EfficientNet-B0 classifier that sorts each face into eight emotions: neutral, happy, sad, surprise, anger, disgust, fear, and contempt. I built it in under a day and kept every piece as small as possible, so it can plausibly run on a device like AR glasses.",
    tags: ["Python", "PyTorch", "YOLOv8", "EfficientNet-B0", "timm", "OpenCV"],
    order: { ai: 6 },
    links: [
      {
        kind: "repo",
        label: "View on GitHub",
        url: "https://github.com/gjGameJam/FaceFigurer",
        primary: true
      }
    ],
    media: {
      videos: [
        { src: "home/a01baa_cdd282993fa74979a1391f363c1f9068.mp4", width: 1918, height: 1020 }
      ]
    }
  },
  {
    id: "flocking",
    name: "Flocking",
    areas: ["ai"],
    tier: 3,
    blurb: "Boids flocking in the browser on plain canvas and vanilla JavaScript. Move your mouse to steer them.",
    desc: "I wrote a flocking simulation of 43 boids that runs in the browser, in plain HTML, CSS, and JavaScript with no libraries. Each boid sums three classic steering rules every frame: separation shoves it away from anyone inside 25px, harder the closer they are (weight 0.25); alignment turns it toward the average heading of neighbors within an 80px perception radius (0.03); and cohesion pulls it toward that group's average position (0.02). Steering force is capped at 2 and speed at 4.2, so the flock banks smoothly instead of snapping, and boids curve back inward once they come within 40px of an edge. Your mouse is a fourth force: a 1.5x repulsion inside 120px that scatters the flock as you sweep across it.",
    tags: ["JavaScript", "HTML Canvas", "Boids / flocking"],
    order: { ai: 7 },
    links: [
      {
        kind: "repo",
        label: "View on GitHub",
        url: "https://github.com/gjGameJam/FlockingInteractive",
        primary: true
      }
    ],
    media: {
      embed: { src: "assets/flocking/flock.html", height: 260 }
    }
  },
  {
    id: "mnist",
    name: "MNIST Digit Classifier",
    areas: ["ai"],
    tier: 3,
    blurb: "A small PyTorch CNN that reads handwritten digits, with a visual audit tool for spotting errors.",
    desc: "A compact convolutional network in PyTorch that recognizes handwritten digits from MNIST. Two convolutional layers (16 and 32 channels, each with max pooling) feed fully connected layers that classify 28 by 28 grayscale images as digits 0 to 9, and the trained model scores 99.07% on the held-out test set. I also built training and testing loops and a visual audit tool that lays out a batch of predictions as a grid, so mistakes are easy to spot.",
    tags: ["Python", "PyTorch", "torchvision", "CNN", "Matplotlib"],
    order: { ai: 9 },
    links: [
      {
        kind: "repo",
        label: "View on GitHub",
        url: "https://github.com/gjGameJam/scratchpAId",
        primary: true
      }
    ],
    media: {
      images: [
        {
          src: "repo/mnist_visual_audit.webp",
          width: 1912,
          height: 967,
          caption: "Visual audit: 100 test digits, each with its prediction and actual label"
        }
      ]
    },
    thumb: "thumbs/mnist.webp"
  },
  {
    id: "anneal",
    name: "Simulated Annealing",
    areas: ["ai"],
    tier: 3,
    blurb: "Simulated annealing on an assignment problem, accepting worse states while the temperature is high.",
    desc: "I wrote an agent that solves an assignment problem with simulated annealing: five agents matched to five items, scored on the total utility of the pairing. While the temperature is high it readily accepts worse states, which is what lets it climb out of local maxima, and as the temperature falls it turns greedier and settles toward the best arrangement it has found. The run in the video tracks the current score against the best score seen.",
    tags: ["Java", "Simulated annealing", "Local search"],
    order: { ai: 12 },
    media: {
      videos: [
        { src: "home/a01baa_1b725e01941f415db65bc180c3dea7b1.mp4", width: 1080, height: 1080 }
      ]
    }
  },
  {
    id: "sentiment",
    name: "Stock Sentiment Analysis",
    areas: ["ai"],
    tier: 3,
    blurb: "Pulls a week of a stock's news, runs it through FinBERT and reduces it to one sentiment score.",
    desc: "A pipeline that turns a week of financial news into a single sentiment score for a stock. Given a ticker it pulls that company's recent coverage from Finnhub, fetches the full article text concurrently, and strips it back to something a model can read: source prefixes, ticker markup, boilerplate disclaimers and smart punctuation go, and near-duplicate articles are dropped. Each article then runs through FinBERT, a BERT model fine-tuned on financial text, which gives probabilities for negative, neutral and positive; I turn that into one signed number with tanh over the gap between positive and negative, so a single confident headline cannot swamp the rest, and average across the week. The run reports the label counts as a stacked bar with the most positive and most negative headlines beneath it.",
    tags: ["Python", "PyTorch", "Hugging Face Transformers", "FinBERT", "NLP", "pandas"],
    order: { ai: 5 },
    links: [
      {
        kind: "repo",
        label: "View on GitHub",
        url: "https://github.com/gjGameJam/SentimentAnalysis",
        primary: true
      }
    ]
  },

  // Games/Simulations
  {
    id: "mittens",
    name: "10th Life of Mittens",
    areas: ["games"],
    tier: 2,
    blurb: "A tower defense where losing a life costs you the towers: nine lives, then Mittens turns.",
    desc: "A zombie tower defense played as a cat. Mittens defends her home by dragging towers into the path of the horde, and the twist is that the towers are tied to her nine lives: every life lost takes away some of her ability to move them, so the further you fall behind, the less you can rearrange. Lose all nine and she turns into a zombie herself. I designed and implemented the tower mechanics and some of the lighting, working with a group of VGDC students over about two days at a jam hosted at Red Storm Entertainment. It was my first game jam and I had so much fun that I wanted to make more games.",
    tags: ["Unity", "C#"],
    order: { games: 11 },
    links: [
      {
        kind: "play",
        label: "Play 10th Life of Mittens",
        url: "https://blazejmg917.itch.io/10th-life-of-mittens",
        primary: true
      }
    ],
    media: {
      images: [
        {
          src: "repo/mittens_itch_titlecard.webp",
          width: 1920,
          height: 1080,
          caption: "The 10th Life of Mittens title in purple brush lettering, slashed through by white claw marks"
        },
        {
          src: "games/a01baa_c6e7cae5b991428b83872ba4bc918101.webp",
          width: 1920,
          height: 1077,
          caption: "Wave 9 in progress: turret towers on a cracked earth map, zombie hordes closing on the house, and Mittens's nine hearts along the bottom with two blacked out"
        },
        {
          src: "games/a01baa_e20ab55103bd422aa5712261e348685e.webp",
          width: 1920,
          height: 1080,
          caption: "The main menu with Start Game, Credits, and Quit"
        },
        {
          src: "games/a01baa_466a40d5c4354a51b933e2b305c69741.webp",
          width: 1917,
          height: 1080,
          caption: "Game over screen with the score"
        }
      ]
    },
    thumb: "thumbs/mittens.webp",
    role: "Programmer: tower mechanics and some of the lighting",
    event: "Game jam at Red Storm Entertainment, Cary, October 2022",
    year: 2022
  },
  {
    id: "aroundus",
    name: "Around Us",
    areas: ["games"],
    tier: 2,
    blurb: "A wraparound shooter for an eight-projector wall: crewmates close in from every side, and you throw paper airplanes.",
    desc: "A first-person shooter made for the Cyma Rubin Visualization Gallery at NC State, where the display is eight projectors wrapped around the room in a single 15360 by 1080 strip. Among Us crewmates spawn at random points on a circle around you and march straight in, so the fight really is on every side at once, and your only weapon is a paper airplane. Aim comes from a DualShock 4's gyroscope, through Phillips Albright's gallery template: it registers a custom input layout that reads the raw gyro bytes off the controller and folds them into camera rotation, so you point the pad where you want to throw. Two of us built the game on top of that in about three days.",
    tags: ["Unity", "C#", "Gyroscopic input", "Cyma Rubin Visualization Gallery"],
    order: { games: 8 },
    links: [
      {
        kind: "play",
        label: "Play Around Us",
        url: "https://gjgamejam.itch.io/around-us",
        primary: true
      },
      { kind: "repo", label: "View on GitHub", url: "https://github.com/gjGameJam/AroundUs" },
      {
        kind: "context",
        label: "Cyma Rubin Visualization Gallery",
        url: "https://www.lib.ncsu.edu/spaces/cyma-rubin-visualization-gallery"
      },
      {
        kind: "credit",
        label: "Phillips Albright's gyro template",
        url: "https://github.com/phillipsalbright/NCSU-Visualization-Gallery-Gyro-Template"
      }
    ],
    media: {
      videos: [
        {
          src: "games/a01baa_717e58572d3843cdb77ce3f8100665c7.mp4",
          width: 640,
          height: 360,
          poster: "games/a01baa_717e58572d3843cdb77ce3f8100665c7f000.webp"
        }
      ],
      images: [
        {
          src: "repo/aroundus_itch_screenshot.webp",
          width: 1920,
          height: 563,
          caption: "The game rendered across the full wraparound wall: crewmates closing in past a starfield window, reticle centered"
        },
        {
          src: "repo/aroundus_itch_cover.webp",
          width: 253,
          height: 233,
          caption: "A red crewmate beside a starfield window with the paper airplane reticle"
        }
      ]
    },
    thumb: "thumbs/aroundus.webp",
    role: "One of two developers"
  },
  {
    id: "claimar",
    name: "ClaimAR",
    areas: ["games"],
    tier: 2,
    blurb: "A Snap Spectacles AR land grab: walk real ground to stake cells, close the loop, and the territory fills in.",
    desc: "A multiplayer AR game for Snap Spectacles where the board is the ground you are standing on. Walking across unclaimed two-meter cells drops stakes, closing a loop back to your own territory fills in everything inside it, and stepping on your own stake costs you the run. I wanted people to run around outside and play a game at the same time, partly inspired by Pokémon GO. Building it solo in Lens Studio and TypeScript meant owning the networking: every cell is replicated through an eventually consistent cloud store, with claims written at a paced rate so a large fill stays inside the sync layer's throughput limits, and a heads-up minimap shows who owns what.",
    tags: [
      "TypeScript",
      "Lens Studio",
      "Snap Spectacles",
      "Spectacles Sync Kit",
      "GPS geolocation",
      "Multiplayer networking"
    ],
    order: { games: 4 },
    links: [
      {
        kind: "repo",
        label: "View on GitHub",
        url: "https://github.com/gjGameJam/MultiClaimAR",
        primary: true
      }
    ],
    media: {
      videos: [
        {
          src: "games/a01baa_a44f6fb65f344069863ec6a906b3f6af.mp4",
          width: 960,
          height: 720,
          poster: "games/a01baa_a44f6fb65f344069863ec6a906b3f6aff000.webp"
        }
      ]
    },
    role: "Solo: design, gameplay and all networking",
    year: 2026
  },
  {
    id: "duo",
    name: "Duo Protocol",
    areas: ["games"],
    tier: 2,
    blurb: "Asymmetrical co-op: one player holds the gun, the other holds the map, the radio, and the budget.",
    desc: "An asymmetrical co-op shooter where two players defend a base against waves of alien bugs. One has boots on the ground in first person, the other sits in a bunker watching CRT feeds and a wall map, buying weapons, calling artillery strikes and supply drops, and switching on the base defenses. On a team of five I built the commander's interface, the soldier's compass, the base turrets, and the canyon map, which taught me a lot about UI design and the landscaping tools in Unreal. It is best with two gamepads, though there is a single-player mode that swaps between the roles.",
    tags: ["Unreal Engine"],
    order: { games: 12 },
    links: [
      {
        kind: "play",
        label: "Play Duo Protocol",
        url: "https://phillips-albright.itch.io/mission-control",
        primary: true
      }
    ],
    media: {
      images: [
        {
          src: "repo/duo_itch_splitview.webp",
          width: 1920,
          height: 1080,
          caption: "Split screen: the soldier's first-person view above, the commander's bunker of CRT screens and wall map below"
        },
        {
          src: "repo/duo_itch_commander_menu.webp",
          width: 1920,
          height: 1080,
          caption: "The commander's weapon purchase menu beside the base health bar and wave timer"
        },
        {
          src: "repo/duo_itch_turret_artillery.webp",
          width: 1920,
          height: 1080,
          caption: "The soldier looking up at a base turret and an artillery plane passing overhead"
        },
        {
          src: "repo/duo_itch_cover.webp",
          width: 805,
          height: 618,
          caption: "Duo Protocol cover art: two CRT monitors and a field radio on a bunker desk"
        },
        {
          src: "games/a01baa_1ef95e790b6a43cc8d2c8f6b0d20f84f.webp",
          width: 968,
          height: 864,
          caption: "Overhead view of the canyon map"
        }
      ]
    },
    thumb: "thumbs/duo.webp",
    role: "Commander UI, soldier's compass, base turrets, canyon map design"
  },
  {
    id: "dusted",
    name: "DusteD",
    areas: ["games"],
    tier: 2,
    blurb: "A solo 36-hour idle game: click dust, buy Brad the Brick, watch the shelf fill up.",
    desc: "A clicker and idle game about dust, made alone in about 36 hours for Ludum Dare 56, whose compo rules mean one person makes everything. I threw it together around a busy stretch of school: the programming took a few hours and the art took most of a day, because art is not what I do. You click a ball of dust and spend it at the Dust Depot on collectors that keep working while you are away, from a dust bunny and Mr. Marble up through Phillip the Penguin and Beembo the Frog, each about five times the last, and the shelf along the bottom fills with everything you own. It is the only game I have made every asset for, and it gave me a much greater appreciation for artists and solo developers.",
    tags: ["Unreal Engine", "Aseprite"],
    order: { games: 14 },
    links: [
      {
        kind: "play",
        label: "Play DusteD",
        url: "https://gjgamejam.itch.io/dusted",
        primary: true
      },
      { kind: "repo", label: "View on GitHub", url: "https://github.com/gjGameJam/DusteD" }
    ],
    media: {
      images: [
        {
          src: "repo/dusted_itch_shelf_late.webp",
          width: 1919,
          height: 1079,
          caption: "Late game: the shelf packed end to end with every collector, dust counting in the hundreds of millions"
        },
        {
          src: "repo/dusted_itch_shop.webp",
          width: 1908,
          height: 1079,
          caption: "The Dust Depot, listing all ten collectors with their dust per second, capacity, and price"
        },
        {
          src: "repo/dusted_itch_shelf_early.webp",
          width: 1919,
          height: 1079,
          caption: "Early game: 39 dust and a nearly empty shelf holding six dust bunnies"
        },
        {
          src: "repo/dusted_itch_shelf_mid.webp",
          width: 1919,
          height: 1079,
          caption: "Mid game: twelve million dust and seven species stocked on the shelf"
        },
        {
          src: "repo/dusted_itch_menu.webp",
          width: 1919,
          height: 1079,
          caption: "The DusteD main menu"
        },
        {
          src: "repo/dusted_itch_cover.webp",
          width: 1920,
          height: 1080,
          caption: "Cover art: every dust collector arranged around a dusty, cobwebbed frame"
        }
      ]
    },
    thumb: "thumbs/dusted.webp",
    role: "Solo: all code and all art",
    event: "Ludum Dare 56 (October 2024), compo",
    year: 2024
  },
  {
    id: "galaxian",
    name: "Galaxian3D",
    areas: ["games", "ai"],
    tier: 2,
    blurb: "A 3D Galaxian tribute whose enemies grow deadlier each round via a genetic algorithm.",
    desc: "A third-person dogfighting game in space, built as a 3D tribute to Galaxian (1979) with four enemy types drawn from the original. The part I am proudest of is the purple squadron: their Unreal behavior trees are driven by a genetic algorithm, so the enemies that did the most damage to you get their genes spliced and mutated into the next round's wave. I led a team of four and built the genetic enemies, the skybox, and the UI, and we finished the whole thing in under a week. It is a Windows download rather than a browser game.",
    tags: ["Unreal Engine", "Behavior trees", "Genetic algorithm", "3D", "Windows"],
    order: { games: 3, ai: 4 },
    links: [
      {
        kind: "play",
        label: "Play Galaxian3D",
        url: "https://gjgamejam.itch.io/galaxian3d",
        primary: true
      }
    ],
    media: {
      videos: [
        {
          src: "games/a01baa_7325bc41422c4e239e75bb4ea15d3336.mp4",
          width: 1920,
          height: 1080,
          poster: "games/a01baa_7325bc41422c4e239e75bb4ea15d3336f000.webp"
        }
      ],
      images: [
        {
          src: "repo/galaxian_itch_cover.webp",
          width: 1043,
          height: 571,
          caption: "The player's white fighter chasing a purple genetic enemy across a violet nebula"
        }
      ]
    },
    thumb: "thumbs/galaxian.webp",
    role: "Team lead; genetic enemies, skybox and UI"
  },
  {
    id: "engine",
    name: "Game Engine",
    areas: ["games"],
    tier: 2,
    blurb: "A networked game engine built from scratch, with ZeroMQ multiplayer and SFML rendering.",
    desc: "A flexible, networked game engine I built alone for the game engines course in my game development concentration. It runs a client-server architecture for multiplayer over ZeroMQ, using Pub/Sub for broadcast state and Req/Rep for direct exchanges, and renders its figures through SFML. It was my first C++ project, written while I was still learning C, so the conventions are rougher than what I would write today.",
    tags: ["C++", "ZeroMQ", "SFML", "Client-server multiplayer"],
    order: { games: 6 }
  },
  {
    id: "wasteland",
    name: "Golden Wasteland",
    areas: ["games"],
    tier: 2,
    blurb: "Scavenge the desert by day, run a restaurant by night, and every appliance you buy upgrades the scavenging.",
    desc: "A pixel art game split between two scenes: by day a small robot scavenges an arid golden wasteland against a timer, by night it runs the Golden Dragon, a food store where the takings buy new appliances. The appliances are the upgrade tree, so fitting out the kitchen raises what you can do outside: a \"Wasteland patty flipper 9000\" buys pickup range, and your carrying capacity climbs from ten rocks to sixty. I programmed the restaurant side and the handoff between the two scenes, which is where the whole loop lives. I led the team of three.",
    tags: ["Unity", "C#"],
    order: { games: 13 },
    links: [
      {
        kind: "play",
        label: "Play Golden Wasteland",
        url: "https://fiargin.itch.io/the-golden-wasteland",
        primary: true
      }
    ],
    media: {
      images: [
        {
          src: "games/a01baa_1c3e98b9a21747a996a4604c6bbf4866.webp",
          width: 1024,
          height: 1024,
          caption: "Golden Wasteland title art: a small robot carrying a crate across golden sand while a huge golden dragon coils around the frame"
        },
        {
          src: "games/a01baa_3c40c9ede61c4a158f55cda9568ed4f0.webp",
          width: 1027,
          height: 573,
          caption: "The robot outside the Golden Dragon storefront, carrying capacity at ten"
        },
        {
          src: "games/a01baa_293b416d5563403b802053c3b29c1b1a.webp",
          width: 1025,
          height: 573,
          caption: "The robot carrying a gold nugget past two giant buried dragon claws, capacity now sixty"
        },
        {
          src: "games/a01baa_e903ad3072c64114aaa32db0a51a4b59.webp",
          width: 1025,
          height: 577,
          caption: "The Golden Dragon kitchen before upgrades, every appliance a silhouette marked with a question mark"
        },
        {
          src: "games/a01baa_d338483fe13745118690e6c52c49f622.webp",
          width: 1030,
          height: 578,
          caption: "The same kitchen fitted out in gold, with a tooltip for the Wasteland patty flipper 9000"
        }
      ]
    },
    thumb: "thumbs/wasteland.webp",
    role: "Team lead; restaurant programming and the communication between scenes"
  },
  {
    id: "graphics",
    name: "Graphics Engine",
    areas: ["games"],
    tier: 2,
    blurb: "Rasterizing textured triangles in WebGL, with modulate and replace texture modes.",
    desc: "A rasterizer written in WebGL and JavaScript that renders images and colors through the graphics pipeline, supporting both modulate and replace texture modes. Triangle strip compression was the part that stuck with me, since it feeds straight into generating triangle meshes dynamically for the glider work in Folded.",
    tags: ["JavaScript", "WebGL", "Rasterization", "Texture mapping"],
    order: { games: 7 },
    media: {
      images: [
        {
          src: "home/a01baa_84da9a943abc42d08361eeec8f00dab0.webp",
          width: 639,
          height: 632,
          caption: "Textured triangles rendered through the rasterizer"
        }
      ]
    },
    thumb: "thumbs/graphics.webp"
  },
  {
    id: "hellspawner",
    name: "HellSpawner",
    areas: ["games"],
    tier: 2,
    blurb: "A Ludum Dare boss rush where you summon your own bosses, then steal the powers of the ones you kill.",
    desc: "A 2D boss rush made for Ludum Dare 55, whose theme was summoning, so you summon the bosses that try to kill you. You play a goop that takes an ability from each boss it defeats: a charge shot from the Hellscourge, an invincible eight-directional dash from the Lich, a slowing frost cloud from the Frost Warden. Three difficulties run from regenerating between fights to HellSpawner mode, where you have one point of health for the whole run. I was one of three programmers on a team of six, working on the UI, the enemy AI, and the game managing logic.",
    tags: ["Unity", "C#", "2D", "Pixel Art", "Ludum Dare 55"],
    order: { games: 5 },
    links: [
      {
        kind: "play",
        label: "Play HellSpawner",
        url: "https://olatiny.itch.io/hellspawner",
        primary: true
      }
    ],
    media: {
      images: [
        {
          src: "games/a01baa_aa92c8e8c3d048918353e3aea6b45174.webp",
          width: 794,
          height: 446,
          caption: "The Hellscourge boss firing a full-screen laser at the player"
        },
        {
          src: "games/a01baa_db78524c7a564c598312949e560d59be.webp",
          width: 794,
          height: 446,
          caption: "HellSpawner title screen with Normal, Hard, and HellSpawner difficulty options"
        },
        {
          src: "games/a01baa_215995496b404e4eba7c8992860bf466.webp",
          width: 794,
          height: 446,
          caption: "The summoning circle and the Lich's summon card"
        },
        {
          src: "games/a01baa_49b60e1f828f44a7aaaa0f6bfc7d308f.webp",
          width: 794,
          height: 446,
          caption: "The Frost Warden fight in an ice cavern"
        },
        {
          src: "games/a01baa_23ba5f6db2ef4bfb92ee4e651c998c15.webp",
          width: 794,
          height: 446,
          caption: "The Lich fight"
        }
      ]
    },
    thumb: "thumbs/hellspawner.webp",
    role: "One of three programmers: UI, enemy AI and game managing logic",
    event: "Ludum Dare 55 (2024)",
    year: 2024
  },
  {
    id: "sixfloors",
    name: "Six Floors Under",
    areas: ["games"],
    tier: 2,
    blurb: "A Ludum Dare puzzle game: a wolf assassin must finish the hit before the elevator lands.",
    desc: "A puzzle game made for Ludum Dare 54, whose theme was limited space. You play a wolf assassin who has to take out a target inside a crowded elevator before it reaches the ground floor, manipulating the other passengers so none of them sees the body. I pitched the idea and six of us built it over about a week, with the jam alpha done in two days. It was our first top-100 finish, 34th in audio globally, which I put down to polish like syncing the characters to the music, and it was the first time I did any art rather than systems and UI.",
    tags: ["Unity", "C#"],
    order: { games: 2 },
    links: [
      {
        kind: "play",
        label: "Play Six Floors Under",
        url: "https://blazejmg917.itch.io/six-floors-under",
        primary: true
      },
      {
        kind: "store",
        label: "View on Steam",
        url: "https://store.steampowered.com/app/2902590/Six_Floors_Under/"
      }
    ],
    media: {
      images: [
        {
          src: "games/a01baa_b1ed29641038408f9e4b354b0c9503a0.webp",
          width: 1202,
          height: 760,
          caption: "Title screen"
        },
        {
          src: "games/a01baa_f7a3abe6641d4b1ab8e0250e73e2faab.webp",
          width: 1195,
          height: 752,
          caption: "Level select"
        },
        {
          src: "games/a01baa_0090ff5329944a658d19c618fca6d9cf.webp",
          width: 1200,
          height: 758,
          caption: "Inside a level"
        },
        {
          src: "games/a01baa_58fd1d62d26d46459fbd032e8efded97.webp",
          width: 1202,
          height: 722,
          caption: "Game over"
        }
      ]
    },
    thumb: "thumbs/sixfloors.webp"
  },
  {
    id: "skyrates",
    name: "Skyrates",
    areas: ["games"],
    tier: 2,
    blurb: "Kobold sky pirates: parkour the floating islands for loot, upgrade the airship, then fight for the sky.",
    desc: "An open-world adventure where you play a kobold sky pirate. On the floating islands you parkour to crack open procedurally generated chests, then spend the haul upgrading your airship so you can sail further out, and between islands the sky is open water where you fight enemy ships and find new land. It is released and playable, and stays a prototype in the sense that the world grows by adding islands. I was lead developer on a team of six, writing the enemy ship behavior trees and the player ship programming, helping build the chest generation, and putting the UI on Unreal's Common UI plugin so it plays properly on a controller.",
    tags: ["Unreal Engine"],
    order: { games: 10 },
    links: [
      {
        kind: "play",
        label: "Play Skyrates",
        url: "https://gjgamejam.itch.io/skyrates",
        primary: true
      }
    ],
    media: {
      images: [
        {
          src: "repo/skyrates_itch_island.webp",
          width: 1920,
          height: 1080,
          caption: "A low-poly island floating in the clouds with a ship moored at its edge and more islands in the distance"
        },
        {
          src: "repo/skyrates_itch_airship.webp",
          width: 738,
          height: 822,
          caption: "The kobold beside the airship: a dragon-headed hull slung under a spiked balloon bearing a crimson dragon crest"
        },
        {
          src: "repo/skyrates_itch_ruin.webp",
          width: 1920,
          height: 1080,
          caption: "The kobold at the foot of a huge cracked stone ruin"
        },
        {
          src: "repo/skyrates_itch_logo.webp",
          width: 630,
          height: 500,
          caption: "The Skyrates logo painted in pixel art on a ship sail"
        }
      ]
    },
    thumb: "thumbs/skyrates.webp",
    role: "Lead developer: enemy ship behavior trees, player ship programming, chest generation, Common UI"
  },
  {
    id: "sumo",
    name: "Sumo Slapshot",
    areas: ["games"],
    tier: 2,
    blurb: "Couch co-op air hockey that breaks into a sumo match, and whoever falls decides where the puck goes.",
    desc: "A two-player couch game that keeps swapping sports on you. It starts as air hockey: strike the puck, dash, and grab the sumo powerup. Trigger it and the game cuts to a sumo ring where both players mash to shove each other out, and the direction the loser falls is the direction the puck flies when you cut back. I was lead programmer on a team of four, building it in Unreal for the weeklong 2025 Triangle Game Jam, which I also helped plan and organize.",
    tags: ["Unreal Engine"],
    order: { games: 9 },
    links: [
      {
        kind: "play",
        label: "Play Sumo Slapshot",
        url: "https://randompr0file.itch.io/sumo-slapshot",
        primary: true
      },
      { kind: "repo", label: "View on GitHub", url: "https://github.com/gjGameJam/SumoHockey" }
    ],
    media: {
      images: [
        {
          src: "repo/sumo_itch_ring.gif",
          width: 313,
          height: 266,
          caption: "Two sumo wrestlers squaring up in the ring as the countdown runs"
        },
        {
          src: "games/a01baa_cc0306aaf53f4fb79a25e7314542fe78.webp",
          width: 1320,
          height: 525,
          caption: "The air hockey table styled as a zen rock garden ringed with torii gates"
        },
        {
          src: "games/a01baa_45007f52424f44078a3d63c86c9d08a9.webp",
          width: 617,
          height: 229,
          caption: "Close-up of a cartoon sumo wrestler's face"
        },
        {
          src: "repo/sumo_itch_cover.webp",
          width: 1057,
          height: 822,
          caption: "Sumo Slapshot cover art: the logo inside a red torii gate"
        }
      ]
    },
    thumb: "thumbs/sumo.webp",
    role: "Lead programmer",
    event: "Triangle Game Jam 2025 (Grant helped plan and organize)",
    year: 2025
  },

  // Cybersecurity
  {
    id: "bb84",
    name: "BB84",
    areas: ["cyber"],
    tier: 2,
    blurb: "BB84 key distribution in Qiskit, hardened with post-quantum signatures and hybrid keying.",
    desc: "A BB84 quantum key distribution simulation in Qiskit, built the way real deployments have to be. Alice and Bob sift their bits and compare a sacrificial subset to estimate the quantum bit error rate, which a full intercept-resend attack drives to about 25% and gives Eve away. Physics cannot authenticate the classical channel, so every message on it is signed with ML-DSA, and the final key optionally mixes in an ML-KEM shared secret before AES-256-GCM encrypts the payload. I started it to get my feet wet with post-quantum cryptography and Qiskit after reading how qubit collapse could expose an eavesdropper.",
    tags: [
      "Python",
      "Qiskit",
      "BB84",
      "ML-DSA (Dilithium)",
      "ML-KEM (Kyber)",
      "AES-256-GCM",
      "pytest"
    ],
    order: { cyber: 1 },
    links: [
      {
        kind: "repo",
        label: "View on GitHub",
        url: "https://github.com/gjGameJam/QuantumEncrypt",
        primary: true
      }
    ],
    media: {
      images: [
        {
          src: "home/a01baa_c50fa339988d40ff9de8164b0a5da35d.webp",
          width: 2392,
          height: 3766,
          caption: "The protocol, end to end"
        },
        {
          src: "home/a01baa_34b7c2a3057f4cf7930a6ef808e3524d.webp",
          width: 1350,
          height: 923,
          caption: "QBER against Eve's tap fraction"
        },
        {
          src: "repo/bb84_detection_vs_test_bits.webp",
          width: 1409,
          height: 923,
          caption: "Detection probability against sacrificed test bits"
        }
      ]
    },
    thumb: "thumbs/bb84.webp"
  },
];

import { Layer } from "@reearth/core";

export const DEFAULT_LAYERS_PLUGIN_PLAYGROUND: Layer[] = [
  {
    type: "simple",
    id: "chiyoda-3d-tiles",
    title: "Chiyoda 3D Tiles",
    visible: false,
    data: {
      type: "3dtiles",
      url: "https://assets.cms.plateau.reearth.io/assets/11/6d05db-ed47-4f88-b565-9eb385b1ebb0/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod1/tileset.json"
    }
  },
  {
    type: "simple",
    id: "japanese-heritage-sites",
    title: "Japanese Heritage Sites",
    visible: false,
    data: {
      type: "geojson",
      value: {
        features: [
          {
            geometry: {
              coordinates: [132.45352379465163, 34.39549955011865],
              type: "Point"
            },
            id: 0,
            properties: {
              criteria: "vi",
              description:
                "The Hiroshima Peace Memorial (広島平和記念碑, Hiroshima Heiwa Kinenhi), originally the Hiroshima Prefectural Industrial Promotion Hall, and now commonly called the Genbaku Dome, Atomic Bomb Dome or A-Bomb Dome (原爆ドーム, Genbaku Dōmu), is part of the Hiroshima Peace Memorial Park in Hiroshima, Japan and was designated a UNESCO World Heritage Site in 1996.[1]  The building was the only structure that remained standing in the area around the atomic bombing of Hiroshima at the end of World War II.[1] The ruin of the hall serves as a memorial to the over 140,000[2] people who were killed in the bombing. It is permanently kept in a state of preserved ruin as a reminder of the destructive effects of nuclear warfare.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/7/77/Genbaku_Dome04-r.JPG",
              monuments: "Atomic bomb Dome",
              title: "Hiroshima Peace Memorial (Genbaku Dome)",
              type: "Cultural",
              year: "1996"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [139.77590810169576, 35.71563849868614],
              type: "Point"
            },
            id: 1,
            properties: {
              criteria: "i, ii, vi",
              description:
                'The National Museum of Western Art (国立西洋美術館, Kokuritsu Seiyō Bijutsukan, lit. "National Western Art Museum", NMWA) is the premier public art gallery in Japan specializing in art from the Western tradition.  The museum is in the museum and zoo complex in Ueno Park in Taitō, central Tokyo. It received 1,162,345 visitors in 2016.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/9/9d/National_museum_of_western_art05s3200.jpg",
              monuments: "National Museum of Western Art",
              title:
                "The Architectural Work of Le Corbusier, an Outstanding Contribution to the Modern Movement",
              type: "Cultural",
              year: "2016"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [129.8701706206089, 32.73423314273397],
              type: "Point"
            },
            id: 2,
            properties: {
              criteria: "iii",
              description:
                "Hidden Christian Sites in the Nagasaki Region (Japanese: 長崎と天草地方の潜伏キリシタン関連遺産) is a group of twelve sites in Nagasaki Prefecture and Kumamoto Prefecture relating to the history of Christianity in Japan. The Nagasaki churches are unique in the sense that each tells a story about the revival of Christianity after a long period of official suppression. Proposed jointly in 2007 for inscription on the UNESCO World Heritage List under criteria ii, iii, iv, v, and vi, the submission named at the time Churches and Christian Sites in Nagasaki on the Tentative List, was recognized on January 30, 2018, as a World Heritage Site.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/6/66/Nh%C3%A0_th%E1%BB%9D_ch%C3%ADnh_t%C3%B2a_Oura.jpg",
              monuments: "Ōura Cathedral, Hara Castle, Hirado Island",
              title: "Hidden Christian Sites in the Nagasaki Region",
              type: "Cultural",
              year: "2018"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [142.2021681948797, 27.085702786406635],
              type: "Point"
            },
            id: 3,
            properties: {
              criteria: "ix",
              description:
                "The Ogasawara Islands, also known as the Bonin Islands, are a Japanese archipelago of over 30 subtropical and tropical islands located around 1,000 kilometers (620 mi) SSE of Tokyo and 1,600 kilometers (1,000 mi) northwest of Guam. The group as a whole has a total area of 84 square kilometers (32 sq mi) but only two of the islands are permanently inhabited, Chichijima and Hahajima. Together, their population was 2560 as of 2021. Administratively, Tokyo's Ogasawara Subprefecture also includes the settlements on the Volcano Islands and the Self-Defense Force post on Iwo Jima. The seat of government is Chichijima.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/4/43/Minamijima.jpg",
              monuments:
                "Natural Site: Chichi-jima, Haha-jima, Muko-jima, Iwo-jima",
              title: "Ogasawara Islands",
              type: "Natural",
              year: "2011"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [138.88761863083946, 36.25560040727668],
              type: "Point"
            },
            id: 4,
            properties: {
              criteria: "ii, iv",
              description:
                "Tomioka Silk Mill (富岡製糸場, Tomioka Seishijō) is Japan's oldest modern model silk reeling factory, established in 1872 by the government to introduce modern machine silk reeling from France and spread its technology in Japan. The factory is designated by the government as a National Historic Site and all its buildings are preserved in very good condition. It is located in the city of Tomioka, Gunma Prefecture, Japan, about 100 km northwest of Tokyo. It is also featured as the 'ni' card in Jomo Karuta playing cards.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/3/31/%E5%AF%8C%E5%B2%A1%E8%A3%BD%E7%B3%B8%E5%A0%B4%E3%83%BB%E7%B9%B0%E7%B3%B8%E5%A0%B4.jpg",
              monuments: "Tomioka Silk Mill",
              title: "Tomioka Silk Mill and Related Sites",
              type: "Cultural",
              year: "2014"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [130.52272670508435, 30.351816517713058],
              type: "Point"
            },
            id: 5,
            properties: {
              criteria: "vii, ix",
              description:
                "Yakushima (屋久島) is one of the Ōsumi Islands in Kagoshima Prefecture, Japan. The island, 504.88 km2 (194.94 sq mi) in area, has a population of 13,178. Access to the island is by hydrofoil ferry (7 or 8 times a day from Kagoshima, depending on the season), slow car ferry (once or twice a day from Kagoshima), or by air to Yakushima Airport (3 to 5 times daily from Kagoshima, once daily from Fukuoka and once daily from Osaka). Administratively, the whole island is the town of Yakushima. The town also serves neighbouring Kuchinoerabujima. 42% of the island is within the borders of the Yakushima National Park.[2]  Yakushima's electricity is more than 50% hydroelectric, and surplus power has been used to produce hydrogen gas in an experiment by Kagoshima University. The island has been a test site for Honda's hydrogen fuel cell vehicle research. (There are no hydrogen cars stationed on the island but electric cars are run by the municipality.)",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/6/68/Yakushima.jpg",
              monuments: "Natural Site: warm temperate ancient forest",
              title: "Yakushima",
              type: "Natural",
              year: "1993"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [140.2871512387805, 40.30903503338022],
              type: "Point"
            },
            id: 6,
            properties: {
              criteria: "ix",
              description:
                "Shirakami-Sanchi (白神山地) is a UNESCO World Heritage Site in the Tōhoku region of northern Honshū, Japan. This mountainous area includes the last virgin forest of Siebold's beech which once covered most of northern Japan. The area straddles both Akita and Aomori Prefectures. Of the entire 1,300 square kilometres (500 sq mi), a tract covering 169.7169.7 square kilometres (65.5 sq mi) was included in the list of World Heritage Sites in 1993.[1] Fauna found in the area includes Japanese black bear, the Japanese serow, Japanese macaque and 87 species of birds. The Shirakami-Sanchi was one of the first sites entered on the World Heritage List in Japan, along with Yakushima, Himeji Castle, and Buddhist Monuments in the Hōryū-ji Area in 1993. Permission is needed from Forest Management to enter the heart of the Shirakami-Sanchi.  Location",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/d/d6/Sirakami_santi.JPG",
              monuments: "Natural Site: Siebold's beech forest, mountains",
              title: "Shirakami-Sanchi",
              type: "Natural",
              year: "1993"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [138.73047692720186, 35.363105014890316],
              type: "Point"
            },
            id: 7,
            properties: {
              criteria: "iii, vi",
              description:
                'Mount Fuji (富士山, Fujisan, Japanese: [ɸɯꜜ(d)ʑisaɴ] ⓘ) is an active stratovolcano located on the Japanese island of Honshū, with a summit elevation of 3,776.24 m (12,389 ft 3 in). It is the tallest mountain in Japan, the second-highest volcano located on an island in Asia (after Mount Kerinci on the island of Sumatra), and seventh-highest peak of an island on Earth.[1] Mount Fuji last erupted from 1707 to 1708.[4][5] The mountain is located about 100 km (62 mi) southwest of Tokyo and is visible from the Japanese capital on clear days. Mount Fuji\'s exceptionally symmetrical cone, which is covered in snow for about five months of the year, is commonly used as a cultural icon of Japan and it is frequently depicted in art and photography, as well as visited by sightseers, hikers and mountain climbers.[6]  Mount Fuji is one of Japan\'s "Three Holy Mountains" (三霊山, Sanreizan) along with Mount Tate and Mount Haku. It is a Special Place of Scenic Beauty and one of Japan\'s Historic Sites.[7] It was added to the World Heritage List as a Cultural Site on June 22, 2013.[7] According to UNESCO, Mount Fuji has "inspired artists and poets and been the object of pilgrimage for centuries". UNESCO recognizes 25 sites of cultural interest within the Mount Fuji locality. These 25 locations include the mountain and the Shinto shrine, Fujisan Hongū Sengen Taisha.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/6/63/Views_of_Mount_Fuji_from_%C5%8Cwakudani_20211202.jpg",
              monuments:
                "Mount Fuji, Fuji Five Lakes, Fujisan Hongū Sengen Shrine, Kitaguchi Hongū Fuji Sengen Shrine, Yamamiya Sengen Shrine, Murayama Sengen Shrine, Suyama Sengen Shrine, Higashiguchi Hongū Fuji Sengen Shrine, Kawaguchi Sengen Shrine, Fuji Omuro Sengen Shrine, Oshino Hakkai, Miho no Matsubara",
              title: "Fujisan, sacred place and source of artistic inspiration",
              type: "Cultural",
              year: "2013"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [129.3919517987853, 28.324736896822976],
              type: "Point"
            },
            id: 8,
            properties: {
              criteria: "x",
              description:
                "Amami Ōshima (奄美大島, Okinawan: Uushima (ウーシマ);[1] Amami: Ushima (ウシマ)[2]), also known as Amami, is the largest island in the Amami archipelago between Kyūshū and Okinawa. It is one of the Satsunan Islands.[3]  The island, 712.35 km2 in area, has a population of approximately 73,000 people. Administratively it is divided into the city of Amami, the towns of Tatsugō, Setouchi, and the villages of Uken and Yamato in Kagoshima Prefecture. Much of the island is within the borders of the Amami Guntō National Park.  In 2021, it was listed as part of the serial UNESCO World Heritage Site of Amami-Ōshima Island, Tokunoshima Island, northern part of Okinawa Island, and Iriomote Island.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/0/07/Amami_beach.jpg",
              monuments: "Amami Ōshima, Tokunoshima, Yanbaru, Iriomote",
              title:
                "Amami-Ōshima Island, Tokunoshima Island, northern part of Okinawa Island, and Iriomote Island",
              type: "Natural",
              year: "2021"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [139.60088904432655, 36.75634275855494],
              type: "Point"
            },
            id: 9,
            properties: {
              criteria: "i, iv, vi",
              description:
                "The UNESCO World Heritage Site Shrines and Temples of Nikkō encompasses 103 buildings or structures and the natural setting around them. It is located in Nikkō, Tochigi Prefecture, Japan. The buildings belong to two Shinto shrines (Futarasan Shrine and Tōshō-gū) and one Buddhist temple (Rinnō-ji). Nine of the structures are designated National Treasures of Japan while the remaining 94 are Important Cultural Properties. UNESCO listed the site as World Heritage in 1999.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/3/35/Nikko_toshogu_shrine.jpg",
              monuments: "Futarasan Jinja, Rinnō-ji, Nikkō Tōshō-gū",
              title: "Shrines and Temples of Nikkō",
              type: "Cultural",
              year: "1999"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [127.71934540326423, 26.217060613572713],
              type: "Point"
            },
            id: 10,
            properties: {
              criteria: "ii, iii, vi",
              description:
                "The Gusuku Sites and Related Properties of the Kingdom of Ryukyu (琉球王国のグスク及び関連遺産群, Ryūkyū ōkoku no gusuku oyobi kanren'isangun) is an UNESCO World Heritage Site which consists of nine sites all located in the Okinawa Prefecture, Japan. The heritage sites include two utaki (or sacred sites, one a gate and the other a grove), the Tamaudun mausoleum, one garden, and five gusuku castles sites, four of which are ruins and one of which is a reconstruction. The sites were inscribed based on the criteria that they were a fine representation of the Ryūkyū Kingdom's culture, whose unique blend of Japanese and Chinese influence made it a crucial economic and cultural junction between several neighboring states.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/9/99/Naha_Shuri_Castle16s5s3200.jpg",
              monuments:
                "Tamaudun, Sonohyan-utaki Ishimon, Nakijin Castle, Zakimi Castle, Katsuren Castle, Nakagusuku Castle, Shuri Castle, Shikinaen, Seifa-utaki",
              title:
                "Gusuku Sites and Related Properties of the Kingdom of Ryukyu",
              type: "Cultural",
              year: "2000"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [136.8984393940156, 36.271120984398905],
              type: "Point"
            },
            properties: {
              criteria: "iv, v",
              description:
                'The Historic Villages of Shirakawa-gō and Gokayama are one of Japan\'s UNESCO World Heritage Sites. The cultural property consists of three historic mountain villages over an area of 68 hectares (170 acres) in the remote Shogawa river valley, stretching across the border of Gifu and Toyama Prefectures in central Japan. Shirakawa-gō (白川郷, "White River Old-District") is located in the village of Shirakawa in Gifu Prefecture. The Gokayama (五箇山, "Five Mountains") area is divided between the former villages of Kamitaira and Taira in Nanto, Toyama Prefecture.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/e/e6/Ogi_Shirakawa-g%C5%8D%2C_Gifu%2C_Japan.jpg",
              monuments: "Shirakawa-go, Gokayama",
              title: "Historic Villages of Shirakawa-gō and Gokayama",
              type: "Cultural",
              year: "1995"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [145.2793846571494, 44.23218809169073],
              type: "Point"
            },
            id: 12,
            properties: {
              criteria: "ix, x",
              description:
                'Shiretoko National Park (知床国立公園, Shiretoko Kokuritsu Kōen) covers most of the Shiretoko Peninsula at the northeastern tip of the island of Hokkaidō, Japan. The word "Shiretoko" is derived from an Ainu word "sir etok", meaning "the place where the earth protrudes".  One of the most remote regions in Japan, much of the peninsula is only accessible on foot or by boat. Shiretoko is best known as the home of Japan\'s largest population of brown bears, and for offering views of Kunashiri Island, ownership of which Japan and Russia dispute. Shiretoko is also the home of many birds, such as Steller\'s sea eagle and white-tailed eagle, and marine animals such as spotted seal, orca whale, and sperm whale.[1] The park has a hot springs waterfall called Kamuiwakka Falls (カムイワッカの滝, Kamuiwakka-no-taki). Kamui wakka means "water of the gods" in Ainu.  The forests of the park are temperate and subalpine mixed forests; the main tree species include Sakhalin fir (Abies sachalinensis), Erman\'s birch (Betula ermanii) and Mongolian oak (Quercus mongolica). Beyond the forest limit there are impenetrable Siberian dwarf pine (Pinus pumila) thickets.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/6/67/Shiretoko_National_Park.jpg",
              monuments: "Natural Site: peninsula and marine area",
              title: "Shiretoko",
              type: "Natural",
              year: "2005"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [130.1045555644961, 34.241919292453375],
              type: "Point"
            },
            id: 13,
            properties: {
              criteria: "ii, iii",
              description:
                'The three Munakata kami are said in the Kojiki and Nihon Shoki to be daughters of Amaterasu, spawned upon the sun-goddess\' consumption of giant swords.[2][3] Okitsu-Miya on the island of Okinoshima is part of the Shinto shrine complex of Munakata Taisha; no formal shrine buildings were constructed on the island; instead rock piles or yorishiro provided the focus for veneration.[4] Over 80,000 artefacts were ritually deposited at the site from the fourth to the tenth centuries.[1] These have been designated a National Treasure.[5][6] They include mirrors and bronze dragon-head finials from Wei China; gold rings and horse-trappings similar to those found in Silla tombs in Korea; and fragments of a glass bowl from Sassanian Persia.[2] The Munakata clan (宗像氏), powerful local rulers, controlled the route to the continent and "presided over the rituals".[1][2] The many kofun or tumuli in the area are believed to be their burial ground.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/3/35/Okinoshima_aerial01.jpg",
              monuments: "Okinoshima, Munakata Taisha",
              title:
                "Sacred Island of Okinoshima and Associated Sites in the Munakata Region",
              type: "Cultural",
              year: "2017"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [134.6940178914264, 34.839336900628446],
              type: "Point"
            },
            id: 14,
            properties: {
              criteria: "i, iv",
              description:
                'Himeji Castle (姫路城, Himeji-jō) ([çimeʑiꜜʑoː] ⓘ) is a hilltop Japanese castle complex situated in Himeji, a city in the Hyōgo Prefecture of Japan. The castle is regarded as the finest surviving example of prototypical Japanese castle architecture, comprising a network of 83 rooms with advanced defensive systems from the feudal period.[7] The castle is frequently known as Hakuro-jō or Shirasagi-jō ("White Egret Castle" or "White Heron Castle") because of its brilliant white exterior and supposed resemblance to a bird taking flight.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/c/c1/Himeji_castle_in_may_2015.jpg",
              monuments: "Himeji Castle",
              title: "Himeji-jō",
              type: "Cultural",
              year: "1993"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [140.69783073702075, 40.81141824658518],
              type: "Point"
            },
            id: 15,
            properties: {
              criteria: "iii, v",
              description:
                'Jōmon Prehistoric Sites in Northern Japan (北海道・北東北の縄文遺跡群) is a serial UNESCO World Heritage Site consisting of 17 Jōmon-period archaeological sites in Hokkaidō and northern Tōhoku, Japan. The Jōmon period lasted more than 10,000 years, representing "sedentary pre-agricultural lifeways and a complex spiritual culture of prehistoric people".[2]  It was first placed on the World Heritage Tentative List in 2009.[3] In 2021, ICOMOS recommended the inscription in July of the revised serial nomination of seventeen sites under criteria iii and v.[4] It was then officially inscribed on the World Heritage List on 27 July 2021.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/1/1d/140913_Sannai-Maruyama_site_Aomori_Japan01bs6bs6.jpg",
              monuments: "Sannai-Maruyama Site, Ōdai Yamamoto I site",
              title: "Jōmon Prehistoric Sites in Northern Japan",
              type: "Cultural",
              year: "2021"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [135.48675398323545, 34.56364603949242],
              type: "Point"
            },
            id: 16,
            properties: {
              criteria: "iii, iv",
              description:
                'Kofun (古墳, from Sino-Japanese "ancient grave") are megalithic tombs or tumuli in Northeast Asia. Kofun were mainly constructed in the Japanese archipelago between the middle of the 3rd century to the early 7th century CE.[1]  The term is the origin of the name of the Kofun period, which indicates the middle 3rd century to early–middle 6th century. Many kofun have distinctive keyhole-shaped mounds (zempō-kōen fun (前方後円墳)). The Mozu-Furuichi kofungun or tumulus clusters were inscribed on the UNESCO World Heritage List in 2019, while Ishibutai Kofun is one of a number in Asuka-Fujiwara residing on the Tentative List.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/c/c3/NintokuTomb_Aerial_photograph_2007.jpg",
              monuments: "Mozu kofungun, Furuichi kofungun",
              title: "Mozu-Furuichi Kofungun, Ancient Tumulus Clusters",
              type: "Cultural",
              year: "2019"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [141.10797821768844, 38.98800165758016],
              type: "Point"
            },
            id: 17,
            properties: {
              criteria: "ii, vi",
              description:
                "Hiraizumi – Temples, Gardens and Archaeological Sites Representing the Buddhist Pure Land is a grouping of five sites from late eleventh- and twelfth-century Hiraizumi, Iwate Prefecture, Japan. The serial nomination was inscribed on the UNESCO World Heritage List in 2011, under criteria ii and vi.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/b/b9/Hiraizumi_CIMG5318.jpg",
              monuments:
                "Chūson-ji, Mōtsū-ji, Kanjizaiō-in, Muryōkō-in, Kinkeizan",
              title:
                "Hiraizumi – Temples, Gardens and Archaeological Sites Representing the Buddhist Pure Land",
              type: "Cultural",
              year: "2011"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [138.9620827159768, 35.03968949473004],
              type: "Point"
            },
            id: 18,
            properties: {
              criteria: "ii, iii, iv",
              description:
                'Sites of Japan\'s Meiji Industrial Revolution: Iron and Steel, Shipbuilding and Coal Mining (明治日本の産業革命遺産 製鉄・鉄鋼、造船、石炭産業, Meiji nihon no sangyōkakumei isan: seitetsu, tekkō, zōsen, sekitan sangyō) are a group of historic sites that played an important part in the industrialization of Japan in the Bakumatsu and Meiji periods (1850s - 1910), and are part of the industrial heritage of Japan.[1] In 2009 the monuments were submitted jointly for inscription on the UNESCO World Heritage List under criteria ii, iii, and iv. The sites were accepted at the 39th UNESCO World Heritage session, under the condition to take measures "that allow an understanding that there were a large number of Koreans and others who were brought against their will and forced to work under harsh conditions(...)", and again, such measures have yet to be implemented.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/3/31/Hagi_Reverberatory_furnaces.JPG",
              monuments:
                "Hashima Coal Mine, Former Glover House, Shūseikan, Miike Coal Mine, Yawata Steel Works, Mutsurejima Lighthouse, Hagi reverberatory furnace, Shōkasonjuku Academy, Hagi castle town",
              title:
                "Sites of Japan's Meiji Industrial Revolution: Iron and Steel, Shipbuilding and Coal Mining",
              type: "Cultural",
              year: "2015"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [132.31983063912375, 34.29601790074407],
              type: "Point"
            },
            id: 19,
            properties: {
              criteria: "i, ii, iv, vi",
              description:
                'Itsukushima Shrine (厳島神社 (嚴島神社), Itsukushima-jinja) is a Shinto shrine on the island of Itsukushima (popularly known as Miyajima), best known for its "floating" torii gate.[1] It is in the city of Hatsukaichi in Hiroshima Prefecture in Japan, accessible from the mainland by ferry at Miyajimaguchi Station. The shrine complex is listed as a UNESCO World Heritage Site, and the Japanese government has designated several buildings and possessions as National Treasures.[2]  The Itsukushima shrine is one of Japan\'s most popular tourist attractions. It is most famous for its dramatic gate, or torii on the outskirts of the shrine,[2] the sacred peaks of Mount Misen, extensive forests, and its ocean view.[1][3] The shrine complex itself consists of two main buildings: the Honsha shrine and the Sessha Marodo-jinja, as well as 17 other different buildings and structures that help to distinguish it.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/e/ef/Itsukushima_Shrine_Torii_Gate_%2813890465459%29.jpg",
              monuments: "Itsukushima Jinja",
              title: "Itsukushima Shrine",
              type: "Cultural",
              year: "1996"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [135.88988025526982, 33.66917651165235],
              type: "Point"
            },
            id: 20,
            properties: {
              criteria: "ii, iii, iv, vi",
              description:
                "The locations and paths for this heritage site were based on their historical and modern importance in religious pilgrimages. It was also noted for its fusion of Shinto and Buddhist beliefs, and a well documented history of traditions over 1,200 years. The nature scenery on the Kii peninsula was also taken into consideration, with its many streams, rivers and waterfalls. Technically, independent structures at nominated temples and shrines were nominated for this distinction, and not the entire establishments. Sections of the trails were included for this nomination, but not the full length of their expanses. A total of 242 elements were selected from sites and pilgrimage routes for nomination.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/1/17/Danjogaran_Koyasan12n3200.jpg",
              monuments:
                "Seiganto-ji, Kumano Hayatama Taisha, Kongōbu-ji, Niukanshōfu Jinja, Kumano Hongū Taisha, Niutsuhime Jinja, Mount Yoshino, Ōminesan-ji, Kōyasan chōishi-michi, Jison-in, Yoshino Mikumari Jinja, Kinbu Jinja, Kimpusen-ji, Yoshimizu Jinja, Kumano Nachi Taisha, Nachi Falls, Nachi primaeval forest, Fudarakusan-ji, Kumano Kodō",
              title:
                "Sacred Sites and Pilgrimage Routes in the Kii Mountain Range",
              type: "Cultural",
              year: "2004"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [132.44730995577382, 35.1211346509542],
              type: "Point"
            },
            id: 21,
            properties: {
              criteria: "ii, iii, v",
              description:
                'The Iwami Ginzan (石見銀山) was an underground silver mine in the city of Ōda, in Shimane Prefecture on the main island of Honshu, Japan.[1] It was the largest silver mine in Japanese history. It was active for almost four hundred years, from its discovery in 1526 to its closing in 1923.  The mines, mining structures, and surrounding cultural landscape — listed as the "Iwami Ginzan Silver Mine and its Cultural Landscape" — became a UNESCO World Heritage Site in 2007.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/d/d2/180504_Omori_of_Iwami_Ginzan_Silver_Mine_Oda_Shimane_pref_Japan01bs4.jpg",
              monuments:
                "Yunotsu, Iwami Ginzan Kaidō Yunotsu-Okidomaridō, Site of Daikansho, Okidomari, Ginzan Sakunouchi, Site of Yataki-jō, Ōmori Ginzan, Miya-no-mae, Iwami Ginzan Kaidō Tomogauradō, Site of Yahazu-jō, Site of Iwami-jō, Kumagaika residence, Rakan-ji Gohyakurakan, Tomogaura",
              title: "Iwami Ginzan Silver Mine and its Cultural Landscape",
              type: "Cultural",
              year: "2010"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [135.73628561303565, 34.614218456251834],
              type: "Point"
            },
            id: 22,
            properties: {
              criteria: "i, ii, iv, vi",
              description:
                "The UNESCO World Heritage Site Buddhist Monuments in the Hōryū-ji Area includes a variety of buildings found in Hōryū-ji and Hokki-ji in Ikaruga, Nara Prefecture, Japan. These buildings were designated in 1993 along with the surrounding landscape, under several criteria. The structures inscribed are some of the oldest extant wooden buildings in the world, dating from the 7th to 8th centuries. Many of the monuments are also National Treasures of Japan, and reflect an important age of Buddhist influence in Japan. The structures include 21 buildings in the Hōryū-ji East Temple, 9 in the West Temple, 17 monasteries and other buildings, and the pagoda in Hokki-ji",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/1/17/Horyu-ji11s3200.jpg",
              monuments: "Hōryū-ji, Hokki-ji",
              title: "Buddhist Monuments in the Hōryū-ji Area",
              type: "Cultural",
              year: "1993"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [135.83987184558748, 34.688980554104546],
              type: "Point"
            },
            id: 23,
            properties: {
              criteria: "ii, iii, iv, vi",
              description:
                'The UNESCO World Heritage Site Historic Monuments of Ancient Nara encompasses eight places in the old capital Nara in Nara Prefecture, Japan. Five are Buddhist temples, one is a Shinto shrine, one is a Palace and one a primeval forest. The properties include 26 buildings designated by the Japanese Government as National Treasures as well as 53 designated as Important Cultural Properties. All compounds have been recognized as Historic Sites. The Nara Palace Site was designated as Special Historic Site and the Kasugayama Primeval Forest as Special Natural Monument. Tōdai-ji, Kōfuku-ji and the Kasugayama Primeval Forest overlap with Nara Park, a park designated as one of the "Places of Scenic Beauty" by the Ministry of Education, Culture, Sports, Science and Technology (MEXT). UNESCO listed the site as World Heritage in 1998.',
              image:
                "https://upload.wikimedia.org/wikipedia/commons/4/48/Kofukuji0411.jpg",
              monuments:
                "Tōdai-ji, Kōfuku-ji, Kasuga Taisha, Gangō-ji, Yakushi-ji, Tōshōdai-ji, Heijō Palace, Kasugayama Primeval Forest",
              title: "Historic Monuments of Ancient Nara",
              type: "Cultural",
              year: "1998"
            },
            type: "Feature"
          },
          {
            geometry: {
              coordinates: [135.72846036540835, 35.03952605652823],
              type: "Point"
            },
            id: 24,
            properties: {
              criteria: "ii, iv",
              description:
                "The UNESCO World Heritage Site Historic Monuments of Ancient Kyoto (Kyoto, Uji and Otsu Cities) encompasses 17 locations in Japan within the city of Kyoto and its immediate vicinity. In 794, the Japanese imperial family moved the capital to Heian-kyō. The locations are in three cities: Kyoto and Uji in Kyoto Prefecture; and Ōtsu in Shiga Prefecture; Uji and Ōtsu border Kyoto to the south and north, respectively. Of the monuments, 13 are Buddhist temples, three are Shinto shrines, and one is a castle. The properties include 38 buildings designated by the Japanese government as National Treasures, 160 properties designated as Important Cultural Properties, eight gardens designated as Special Places of Scenic Beauty, and four designated as Places of Scenic Beauty. UNESCO listed the site as World Heritage in 1994.",
              image:
                "https://upload.wikimedia.org/wikipedia/commons/3/3c/Kiyomizu.jpg",
              monuments:
                "Kamigamo Jinja, Shimogamo Jinja, Tō-ji, Kiyomizu-dera, Enryaku-ji, Daigo-ji, Ninna-ji, Byōdō-in, Ujigami Jinja, Kōzan-ji, Saihō-ji, Tenryū-ji, Kinkaku-ji, Ginkaku-ji, Ryōan-ji, Nishi Hongan-ji, Nijō-jō",
              title: "Historic Monuments of Ancient Kyoto",
              type: "Cultural",
              year: "1994"
            },
            type: "Feature"
          }
        ],
        type: "FeatureCollection"
      }
    },
    marker: {
      heightReference: "clamp"
    }
  }
];

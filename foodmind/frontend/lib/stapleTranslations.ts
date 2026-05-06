type L = "en"|"vi"|"my"|"ne"|"id"|"zh"|"ko"|"pt"|"th"|"zhTW";

const T: Record<string, Partial<Record<L,string>>> = {
  // ── 野菜・果物 ──────────────────────────────────────────
  "キャベツ":    { en:"Cabbage",        vi:"Bắp cải",       my:"ဂေါ်ဖီထုပ်",   ne:"बन्दाकोपी",    id:"Kubis",           zh:"卷心菜",  ko:"양배추",      pt:"Repolho",            th:"กะหล่ำปลี",    zhTW:"高麗菜"      },
  "にんじん":    { en:"Carrot",         vi:"Cà rốt",        my:"မုန်လာဥ",      ne:"गाजर",         id:"Wortel",          zh:"胡萝卜",  ko:"당근",        pt:"Cenoura",            th:"แครอท",        zhTW:"胡蘿蔔"      },
  "たまねぎ":    { en:"Onion",          vi:"Hành tây",      my:"ကြက်သွန်နီ",   ne:"प्याज",        id:"Bawang bombay",   zh:"洋葱",    ko:"양파",        pt:"Cebola",             th:"หัวหอม",       zhTW:"洋蔥"        },
  "ほうれん草":  { en:"Spinach",        vi:"Rau bina",      my:"ဟင်းနုနယ်",    ne:"पालक",         id:"Bayam",           zh:"菠菜",    ko:"시금치",      pt:"Espinafre",          th:"ผักโขม",       zhTW:"菠菜"        },
  "小松菜":      { en:"Komatsuna",      vi:"Cải thìa Nhật", my:"ကိုမတ်ဆုနာ",  ne:"कोमात्सुना",   id:"Komatsuna",       zh:"小松菜",  ko:"소송채",      pt:"Komatsuna",          th:"โคมัตสึนะ",    zhTW:"小松菜"      },
  "ブロッコリー":{ en:"Broccoli",       vi:"Bông cải xanh", my:"ဘရော်ကိုလီ",  ne:"ब्रोकोली",     id:"Brokoli",         zh:"西兰花",  ko:"브로콜리",    pt:"Brócolis",           th:"บร็อกโคลี",    zhTW:"青花椰菜"    },
  "トマト":      { en:"Tomato",         vi:"Cà chua",       my:"ခရမ်းချဉ်သီး", ne:"टमाटर",        id:"Tomat",           zh:"番茄",    ko:"토마토",      pt:"Tomate",             th:"มะเขือเทศ",    zhTW:"番茄"        },
  "きゅうり":    { en:"Cucumber",       vi:"Dưa chuột",     my:"သခွားသီး",     ne:"काँक्रो",      id:"Timun",           zh:"黄瓜",    ko:"오이",        pt:"Pepino",             th:"แตงกวา",       zhTW:"黃瓜"        },
  "なす":        { en:"Eggplant",       vi:"Cà tím",        my:"ခရမ်းသီး",     ne:"भण्टा",        id:"Terong",          zh:"茄子",    ko:"가지",        pt:"Berinjela",          th:"มะเขือ",       zhTW:"茄子"        },
  "ピーマン":    { en:"Bell Pepper",    vi:"Ớt chuông",     my:"ငရုတ်ကောင်း",  ne:"शिमलामिर्च",   id:"Paprika",         zh:"青椒",    ko:"피망",        pt:"Pimentão",           th:"พริกหวาน",     zhTW:"甜椒"        },
  "アスパラガス":{ en:"Asparagus",      vi:"Măng tây",      my:"Asparagus",    ne:"अस्पाराग्स",   id:"Asparagus",       zh:"芦笋",    ko:"아스파라거스",pt:"Aspargo",            th:"หน่อไม้ฝรั่ง", zhTW:"蘆筍"        },
  "レタス":      { en:"Lettuce",        vi:"Rau diếp",      my:"ဆလပ်",         ne:"लेटिस",        id:"Selada",          zh:"生菜",    ko:"상추",        pt:"Alface",             th:"ผักกาดหอม",    zhTW:"萵苣"        },
  "もやし":      { en:"Bean Sprouts",   vi:"Giá đỗ",        my:"ပဲပေါက်",      ne:"अंकुरित",      id:"Tauge",           zh:"豆芽",    ko:"숙주나물",    pt:"Broto de feijão",    th:"ถั่วงอก",       zhTW:"豆芽"        },
  "長ねぎ":      { en:"Green Onion",    vi:"Hành lá",       my:"ကြက်သွန်မြိတ်",ne:"हरियो प्याज",  id:"Daun bawang",     zh:"大葱",    ko:"대파",        pt:"Cebolinha",          th:"ต้นหอม",       zhTW:"大蔥"        },
  "にんにく":    { en:"Garlic",         vi:"Tỏi",           my:"ကြက်သွန်ဖြူ",  ne:"लसुन",         id:"Bawang putih",    zh:"大蒜",    ko:"마늘",        pt:"Alho",               th:"กระเทียม",     zhTW:"大蒜"        },
  "しょうが":    { en:"Ginger",         vi:"Gừng",          my:"ဂျင်း",         ne:"अदुवा",        id:"Jahe",            zh:"生姜",    ko:"생강",        pt:"Gengibre",           th:"ขิง",          zhTW:"薑"          },
  "たけのこ":    { en:"Bamboo Shoots",  vi:"Măng",          my:"ဝါးရွက်ငုတ်",  ne:"बाँसको मुन्टो",id:"Rebung",          zh:"竹笋",    ko:"죽순",        pt:"Broto de bambu",     th:"หน่อไม้",      zhTW:"竹筍"        },
  "りんご":      { en:"Apple",          vi:"Táo",           my:"ပန်းသီး",       ne:"स्याउ",        id:"Apel",            zh:"苹果",    ko:"사과",        pt:"Maçã",               th:"แอปเปิล",      zhTW:"蘋果"        },
  "バナナ":      { en:"Banana",         vi:"Chuối",         my:"ငှက်ပျောသီး",  ne:"केरा",         id:"Pisang",          zh:"香蕉",    ko:"바나나",      pt:"Banana",             th:"กล้วย",        zhTW:"香蕉"        },
  "みかん":      { en:"Mandarin",       vi:"Quýt",          my:"လိမ္မော်သီး",   ne:"सुन्तला",      id:"Jeruk mandarin",  zh:"橘子",    ko:"귤",          pt:"Tangerina",          th:"ส้มแมนดาริน",  zhTW:"橘子"        },

  // ── きのこ ──────────────────────────────────────────────
  "しめじ":      { en:"Shimeji",        vi:"Nấm shimeji",   my:"ရှိမဲဂျိမှို",  ne:"शिमेजी च्याउ", id:"Jamur shimeji",   zh:"蟹味菇",  ko:"시메지버섯",  pt:"Shimeji",            th:"เห็ดชิเมจิ",   zhTW:"鴻喜菇"      },
  "えのき":      { en:"Enoki",          vi:"Nấm kim châm",  my:"အီနိုကိမှို",   ne:"एनोकी च्याउ",  id:"Jamur enoki",     zh:"金针菇",  ko:"팽이버섯",    pt:"Enoki",              th:"เห็ดเข็มทอง",  zhTW:"金針菇"      },
  "エリンギ":    { en:"King Oyster",    vi:"Nấm trắng",     my:"ကင်းမင်းမှို",  ne:"किङ ओयस्टर",   id:"Jamur tiram",     zh:"杏鲍菇",  ko:"새송이버섯",  pt:"Cogumelo pleurotus", th:"เห็ดนางรม",    zhTW:"杏鮑菇"      },
  "しいたけ":    { en:"Shiitake",       vi:"Nấm hương",     my:"ရှိတာကေမှို",  ne:"शिटाके",        id:"Jamur shiitake",  zh:"香菇",    ko:"표고버섯",    pt:"Shiitake",           th:"เห็ดหอม",      zhTW:"香菇"        },
  "まいたけ":    { en:"Maitake",        vi:"Nấm maitake",   my:"မိုင်တာကေမှို", ne:"माइटाके",      id:"Jamur maitake",   zh:"舞茸",    ko:"잎새버섯",    pt:"Maitake",            th:"เห็ดไมทาเกะ",  zhTW:"舞菇"        },

  // ── 芋類 ──────────────────────────────────────────────
  "じゃがいも":  { en:"Potato",         vi:"Khoai tây",     my:"အာလူး",         ne:"आलु",           id:"Kentang",         zh:"土豆",    ko:"감자",        pt:"Batata",             th:"มันฝรั่ง",     zhTW:"馬鈴薯"      },
  "さつまいも":  { en:"Sweet Potato",   vi:"Khoai lang",    my:"ကြံသောင်",      ne:"मीठो आलु",      id:"Ubi jalar",       zh:"红薯",    ko:"고구마",      pt:"Batata-doce",        th:"มันหวาน",      zhTW:"地瓜"        },
  "さといも":    { en:"Taro",           vi:"Khoai sọ",      my:"ဥတောင်",        ne:"पिंडालु",       id:"Talas",           zh:"芋头",    ko:"토란",        pt:"Inhame",             th:"เผือก",        zhTW:"芋頭"        },
  "長芋":        { en:"Mountain Yam",   vi:"Khoai mài",     my:"တောင်ကြိမ်",    ne:"तरुल",          id:"Ubi air",         zh:"山药",    ko:"참마",        pt:"Inhame japonês",     th:"มันเท้า",      zhTW:"山藥"        },

  // ── 魚介 ──────────────────────────────────────────────
  "サーモン":    { en:"Salmon",         vi:"Cá hồi",        my:"ဆော်လမွန်",     ne:"सालमन",         id:"Salmon",          zh:"三文鱼",  ko:"연어",        pt:"Salmão",             th:"ปลาแซลมอน",   zhTW:"鮭魚"        },
  "まぐろ":      { en:"Tuna",           vi:"Cá ngừ",        my:"တူနာ",           ne:"टुना",           id:"Tuna",            zh:"金枪鱼",  ko:"참치",        pt:"Atum",               th:"ปลาทูน่า",    zhTW:"鮪魚"        },
  "さば":        { en:"Mackerel",       vi:"Cá thu",        my:"ငါးကံ့ကော်",    ne:"म्याकेरेल",     id:"Ikan kembung",    zh:"鲭鱼",    ko:"고등어",      pt:"Cavala",             th:"ปลาซาบะ",     zhTW:"鯖魚"        },
  "鮭":          { en:"Salmon",         vi:"Cá hồi",        my:"ဆော်လမွန်",     ne:"सालमन",         id:"Salmon",          zh:"鲑鱼",    ko:"연어",        pt:"Salmão",             th:"ปลาแซลมอน",   zhTW:"鮭魚"        },
  "あじ":        { en:"Horse Mackerel", vi:"Cá nục",        my:"ငါးမြင်း",      ne:"हर्स म्याकेरेल",id:"Ikan selar",      zh:"竹荚鱼",  ko:"전갱이",      pt:"Carapau",            th:"ปลาทู",       zhTW:"竹莢魚"      },
  "いわし":      { en:"Sardine",        vi:"Cá mòi",        my:"ငါးအသေး",       ne:"सार्डिन",       id:"Sarden",          zh:"沙丁鱼",  ko:"정어리",      pt:"Sardinha",           th:"ปลาซาร์ดีน",  zhTW:"沙丁魚"      },
  "えび":        { en:"Shrimp",         vi:"Tôm",           my:"ပုဇွန်",         ne:"झिंगा",         id:"Udang",           zh:"虾",      ko:"새우",        pt:"Camarão",            th:"กุ้ง",         zhTW:"蝦"          },
  "いか":        { en:"Squid",          vi:"Mực ống",       my:"ငါးဥကောင်",     ne:"स्क्विड",       id:"Cumi-cumi",       zh:"鱿鱼",    ko:"오징어",      pt:"Lula",               th:"ปลาหมึก",     zhTW:"魷魚"        },
  "あさり":      { en:"Clam",           vi:"Ngao",          my:"ကမ်းကြာ",       ne:"सिप",            id:"Kerang",          zh:"蛤蜊",    ko:"바지락",      pt:"Amêijoa",            th:"หอยลาย",       zhTW:"蛤蜊"        },
  "しじみ":      { en:"Corbicula",      vi:"Hến",           my:"ချုံကောင်",      ne:"हेन",            id:"Kerang air tawar",zh:"蚬",      ko:"재첩",        pt:"Corbícula",          th:"หอยน้ำจืด",   zhTW:"蜆"          },
  "ツナ缶":      { en:"Canned Tuna",    vi:"Cá ngừ hộp",    my:"တူနာဗူး",       ne:"टुना क्यान",    id:"Tuna kaleng",     zh:"金枪鱼罐",ko:"참치캔",      pt:"Atum em lata",       th:"ทูน่ากระป๋อง",zhTW:"鮪魚罐頭"    },

  // ── 肉類 ──────────────────────────────────────────────
  "鶏もも肉":    { en:"Chicken Thigh",  vi:"Đùi gà",        my:"ကြက်ပေါင်",     ne:"कुखुराको ठेगुला",id:"Paha ayam",       zh:"鸡腿肉",  ko:"닭다리살",    pt:"Coxa de frango",     th:"ต้นขาไก่",     zhTW:"雞腿肉"      },
  "鶏胸肉":      { en:"Chicken Breast", vi:"Ức gà",         my:"ကြက်ရင်သား",   ne:"कुखुराको छाती", id:"Dada ayam",       zh:"鸡胸肉",  ko:"닭가슴살",    pt:"Peito de frango",    th:"อกไก่",        zhTW:"雞胸肉"      },
  "鶏ささみ":    { en:"Chicken Fillet", vi:"Phi lê gà",     my:"ကြက်ကိုယ်",    ne:"कुखुराको फिलेट",id:"Fillet ayam",     zh:"鸡里脊",  ko:"닭안심",      pt:"Filé de frango",     th:"สันในไก่",     zhTW:"雞里肌"      },
  "手羽先":      { en:"Chicken Wings",  vi:"Cánh gà",       my:"ကြက်တောင်",    ne:"कुखुराको पखेटा",id:"Sayap ayam",      zh:"鸡翅",    ko:"닭날개",      pt:"Asa de frango",      th:"ปีกไก่",       zhTW:"雞翅"        },
  "鶏ひき肉":    { en:"Ground Chicken", vi:"Gà xay",        my:"ကြက်ကြိတ်",    ne:"पिसेको कुखुरा", id:"Ayam cincang",    zh:"鸡肉馅",  ko:"닭 다진 고기",pt:"Frango moído",       th:"ไก่บด",        zhTW:"雞絞肉"      },
  "豚バラ肉":    { en:"Pork Belly",     vi:"Ba chỉ heo",    my:"ဝက်ဗိုက်",      ne:"सुँगुरको पेट",  id:"Perut babi",      zh:"五花肉",  ko:"삼겹살",      pt:"Barriga de porco",   th:"หมูสามชั้น",   zhTW:"五花肉"      },
  "豚ロース":    { en:"Pork Loin",      vi:"Thịt lưng heo", my:"ဝက်ကျောသား",   ne:"सुँगुरको कम्मर",id:"Daging babi iga", zh:"猪里脊",  ko:"돼지등심",    pt:"Lombo de porco",     th:"สันหมู",       zhTW:"豬里肌"      },
  "豚こま切れ":  { en:"Sliced Pork",   vi:"Heo thái lát",  my:"ဝက်အလွှာ",      ne:"सुँगुरको टुक्रा",id:"Irisan babi",     zh:"猪肉片",  ko:"돼지고기 잡채",pt:"Carne de porco fatiada",th:"หมูสไลซ์",   zhTW:"豬肉片"      },
  "豚ひき肉":    { en:"Ground Pork",    vi:"Heo xay",       my:"ဝက်ကြိတ်",      ne:"पिसेको सुँगुर", id:"Babi cincang",    zh:"猪肉馅",  ko:"돼지고기 다진",pt:"Carne de porco moída",th:"หมูบด",        zhTW:"豬絞肉"      },
  "牛バラ肉":    { en:"Beef Short Rib", vi:"Sườn bò",       my:"နွားကြော်",     ne:"गाईको छडा",     id:"Iga sapi",        zh:"牛腩",    ko:"소 갈비",     pt:"Costela de vaca",    th:"ซี่โครงวัว",   zhTW:"牛腩"        },
  "牛こま切れ":  { en:"Sliced Beef",   vi:"Bò thái lát",   my:"နွားအလွှာ",     ne:"गाईको टुक्रा",  id:"Irisan sapi",     zh:"牛肉片",  ko:"소고기 잡채", pt:"Carne bovina fatiada",th:"เนื้อวัวสไลซ์",zhTW:"牛肉片"      },
  "牛ひき肉":    { en:"Ground Beef",    vi:"Bò xay",        my:"နွားကြိတ်",     ne:"पिसेको गाई",    id:"Daging sapi cincang",zh:"牛肉馅",ko:"소고기 다진", pt:"Carne bovina moída", th:"เนื้อวัวบด",   zhTW:"牛絞肉"      },
  "合挽き肉":    { en:"Mixed Mince",    vi:"Thịt xay hỗn hợp",my:"ရောနှောကြိတ်",ne:"मिश्रित मासु",  id:"Daging cincang campur",zh:"混合肉馅",ko:"혼합 다진 고기",pt:"Carne moída mista",th:"เนื้อบดรวม",  zhTW:"混合絞肉"    },
  "ベーコン":    { en:"Bacon",          vi:"Thịt xông khói",my:"ဘေကွန်",        ne:"बेकन",           id:"Bacon",           zh:"培根",    ko:"베이컨",      pt:"Bacon",              th:"เบคอน",        zhTW:"培根"        },
  "ウインナー":  { en:"Sausage",        vi:"Xúc xích",      my:"ဆောဆေ",          ne:"सोसेज",          id:"Sosis",           zh:"香肠",    ko:"소시지",      pt:"Salsicha",           th:"ไส้กรอก",      zhTW:"熱狗"        },
  "ハム":        { en:"Ham",            vi:"Giăm bông",     my:"ဟမ်",            ne:"ह्याम",          id:"Ham",             zh:"火腿",    ko:"햄",          pt:"Presunto",           th:"แฮม",          zhTW:"火腿"        },

  // ── 卵・乳 ──────────────────────────────────────────────
  "卵":          { en:"Egg",            vi:"Trứng",         my:"ကြက်ဥ",          ne:"अण्डा",          id:"Telur",           zh:"鸡蛋",    ko:"달걀",        pt:"Ovo",                th:"ไข่",           zhTW:"雞蛋"        },
  "牛乳":        { en:"Milk",           vi:"Sữa",           my:"နို့",            ne:"दूध",             id:"Susu",            zh:"牛奶",    ko:"우유",        pt:"Leite",              th:"นม",            zhTW:"牛奶"        },
  "豆腐":        { en:"Tofu",           vi:"Đậu phụ",       my:"တိုဖူ",           ne:"टोफु",           id:"Tahu",            zh:"豆腐",    ko:"두부",        pt:"Tofu",               th:"เต้าหู้",      zhTW:"豆腐"        },
  "納豆":        { en:"Natto",          vi:"Natto",         my:"နာတ်တို",        ne:"नाट्टो",         id:"Natto",           zh:"纳豆",    ko:"낫토",        pt:"Natto",              th:"นัตโต",        zhTW:"納豆"        },
  "バター":      { en:"Butter",         vi:"Bơ",            my:"ထောပတ်",         ne:"मक्खन",          id:"Mentega",         zh:"黄油",    ko:"버터",        pt:"Manteiga",           th:"เนย",           zhTW:"奶油"        },
  "チーズ":      { en:"Cheese",         vi:"Phô mai",       my:"ဒိန်ခဲ",         ne:"चिज",            id:"Keju",            zh:"奶酪",    ko:"치즈",        pt:"Queijo",             th:"ชีส",           zhTW:"起司"        },
  "ヨーグルト":  { en:"Yogurt",         vi:"Sữa chua",      my:"ဒိန်ချဉ်",       ne:"दही",            id:"Yogurt",          zh:"酸奶",    ko:"요거트",      pt:"Iogurte",            th:"โยเกิร์ต",     zhTW:"優格"        },
  "豆乳":        { en:"Soy Milk",       vi:"Sữa đậu nành",  my:"ပဲနို့",          ne:"सोया दूध",       id:"Susu kedelai",    zh:"豆浆",    ko:"두유",        pt:"Leite de soja",      th:"นมถั่วเหลือง", zhTW:"豆漿"        },
  "生クリーム":  { en:"Heavy Cream",    vi:"Kem tươi",      my:"ကရင်မ်",         ne:"क्रिम",          id:"Krim kental",     zh:"鲜奶油",  ko:"생크림",      pt:"Creme de leite",     th:"วิปปิ้งครีม",  zhTW:"鮮奶油"      },

  // ── 主食 ──────────────────────────────────────────────
  "白米":        { en:"White Rice",     vi:"Gạo trắng",     my:"ထမင်း",          ne:"चामल",           id:"Beras putih",     zh:"白米饭",  ko:"백미",        pt:"Arroz branco",       th:"ข้าวสวย",      zhTW:"白米"        },
  "食パン":      { en:"Bread",          vi:"Bánh mì",       my:"မုန့်ဖြူ",        ne:"पाउरोटी",        id:"Roti",            zh:"面包",    ko:"식빵",        pt:"Pão de forma",       th:"ขนมปัง",       zhTW:"吐司"        },
  "うどん":      { en:"Udon",           vi:"Mì udon",       my:"ဥဒန်မုန့်ဟင်း",  ne:"उडन",            id:"Udon",            zh:"乌冬面",  ko:"우동",        pt:"Udon",               th:"อุด้ง",         zhTW:"烏龍麵"      },
  "そば":        { en:"Soba",           vi:"Mì soba",       my:"ဆိုဘာမုန့်ဟင်း", ne:"सोबा",           id:"Soba",            zh:"荞麦面",  ko:"소바",        pt:"Soba",               th:"โซบะ",          zhTW:"蕎麥麵"      },
  "パスタ":      { en:"Pasta",          vi:"Mì ống",        my:"ပဿတာ",           ne:"पास्ता",         id:"Pasta",           zh:"意面",    ko:"파스타",      pt:"Macarrão",           th:"พาสต้า",        zhTW:"義大利麵"    },

  // ── 調味料 ──────────────────────────────────────────────
  "醤油":        { en:"Soy Sauce",      vi:"Nước tương",    my:"ပဲငံပြာရည်",    ne:"सोया सस",        id:"Kecap asin",      zh:"酱油",    ko:"간장",        pt:"Molho de soja",      th:"ซีอิ๊ว",        zhTW:"醬油"        },
  "みりん":      { en:"Mirin",          vi:"Mirin",         my:"မိရင်",           ne:"मिरिन",          id:"Mirin",           zh:"味醂",    ko:"미림",        pt:"Mirin",              th:"มิริน",         zhTW:"味醂"        },
  "料理酒":      { en:"Cooking Sake",   vi:"Rượu nấu ăn",  my:"ချက်ပြုတ်ဆေ",   ne:"रान्धन मदिरा",  id:"Sake memasak",    zh:"料酒",    ko:"요리주",      pt:"Saquê culinário",    th:"สาเกทำอาหาร",  zhTW:"料理酒"      },
  "塩":          { en:"Salt",           vi:"Muối",          my:"ဆား",             ne:"नुन",             id:"Garam",           zh:"盐",      ko:"소금",        pt:"Sal",                th:"เกลือ",         zhTW:"鹽"          },
  "砂糖":        { en:"Sugar",          vi:"Đường",         my:"သကြား",          ne:"चिनी",           id:"Gula",            zh:"砂糖",    ko:"설탕",        pt:"Açúcar",             th:"น้ำตาล",        zhTW:"砂糖"        },
  "味噌":        { en:"Miso",           vi:"Tương miso",    my:"မိဆို",           ne:"मिसो",           id:"Miso",            zh:"味噌",    ko:"된장",        pt:"Missô",              th:"มิโซะ",         zhTW:"味噌"        },
  "マヨネーズ":  { en:"Mayonnaise",     vi:"Sốt mayonnaise",my:"မေရိုနက်",       ne:"मेयोनेज",        id:"Mayones",         zh:"蛋黄酱",  ko:"마요네즈",    pt:"Maionese",           th:"มายองเนส",     zhTW:"美乃滋"      },
  "ケチャップ":  { en:"Ketchup",        vi:"Tương cà",      my:"ကက်ချပ်",        ne:"केचप",           id:"Saus tomat",      zh:"番茄酱",  ko:"케첩",        pt:"Ketchup",            th:"ซอสมะเขือเทศ", zhTW:"番茄醬"      },
  "ソース":      { en:"Sauce",          vi:"Nước sốt",      my:"ဆော်",            ne:"सस",             id:"Saus",            zh:"酱汁",    ko:"소스",        pt:"Molho",              th:"ซอส",           zhTW:"醬汁"        },
  "ポン酢":      { en:"Ponzu",          vi:"Sốt ponzu",     my:"ပုံဆူ",           ne:"पोन्जु",         id:"Saus ponzu",      zh:"柚子醋",  ko:"폰즈",        pt:"Molho ponzu",        th:"พอนสึ",         zhTW:"柚子醋醬"    },
  "めんつゆ":    { en:"Noodle Sauce",   vi:"Nước chấm mì",  my:"ခေါက်ဆွဲဆော်",  ne:"नुडल सस",        id:"Saus mie",        zh:"面汁",    ko:"쯔유",        pt:"Caldo para macarrão",th:"ซอสราดหน้า",   zhTW:"麵汁"        },

  // ── スパイス ──────────────────────────────────────────────
  "こしょう":      { en:"Pepper",         vi:"Tiêu",          my:"ငရုတ်ကောင်းမှုန်",ne:"मरिच",          id:"Lada",            zh:"胡椒粉",  ko:"후추",        pt:"Pimenta",            th:"พริกไทย",       zhTW:"胡椒"        },
  "一味唐辛子":    { en:"Chili Powder",   vi:"Ớt bột",        my:"ငရုတ်မှုန်",    ne:"खुर्सानी पाउडर",id:"Bubuk cabai",     zh:"辣椒粉",  ko:"고춧가루",    pt:"Pimenta em pó",      th:"พริกป่น",       zhTW:"辣椒粉"      },
  "七味唐辛子":    { en:"Seven Spice",    vi:"Bảy gia vị",    my:"ငရုတ်ခုနစ်မျိုး",ne:"सात मसला",     id:"Tujuh rempah",    zh:"七味椒粉",ko:"시치미",      pt:"Mistura sete temperos",th:"เครื่องเทศ7ชนิด",zhTW:"七味粉"    },
  "カレー粉":      { en:"Curry Powder",   vi:"Bột cà ri",     my:"ကာရီမှုန်",     ne:"करी पाउडर",     id:"Bubuk kari",      zh:"咖喱粉",  ko:"카레 가루",   pt:"Curry em pó",        th:"ผงกะหรี่",      zhTW:"咖哩粉"      },
  "ガーリックパウダー":{ en:"Garlic Powder",vi:"Tỏi bột",    my:"ကြက်သွန်ဖြူမှုန်",ne:"लसुन पाउडर",  id:"Bubuk bawang putih",zh:"蒜粉",   ko:"마늘 파우더",  pt:"Alho em pó",         th:"กระเทียมผง",    zhTW:"蒜粉"        },

  // ── 食用油 ──────────────────────────────────────────────
  "サラダ油":    { en:"Vegetable Oil",   vi:"Dầu ăn",        my:"ဟင်းသီးဆီ",     ne:"वनस्पति तेल",   id:"Minyak sayur",    zh:"食用油",  ko:"식용유",      pt:"Óleo vegetal",       th:"น้ำมันพืช",     zhTW:"沙拉油"      },
  "ごま油":      { en:"Sesame Oil",      vi:"Dầu mè",        my:"နှမ်းဆီ",        ne:"तिलको तेल",     id:"Minyak wijen",    zh:"芝麻油",  ko:"참기름",      pt:"Óleo de gergelim",   th:"น้ำมันงา",     zhTW:"麻油"        },
  "オリーブオイル":{ en:"Olive Oil",     vi:"Dầu olive",     my:"သံလွင်ဆီ",      ne:"जैतुनको तेल",   id:"Minyak zaitun",   zh:"橄榄油",  ko:"올리브유",    pt:"Azeite",             th:"น้ำมันมะกอก",   zhTW:"橄欖油"      },

  // ── 缶詰 ──────────────────────────────────────────────
  "コーン缶":    { en:"Canned Corn",     vi:"Ngô hộp",       my:"ပြောင်းဖူးဗူး",  ne:"मकै क्यान",     id:"Jagung kaleng",   zh:"玉米罐头",ko:"옥수수 캔",   pt:"Milho em lata",      th:"ข้าวโพดกระป๋อง",zhTW:"玉米罐頭"    },
  "トマト缶":    { en:"Canned Tomato",   vi:"Cà chua hộp",   my:"ခရမ်းချဉ်ဗူး",  ne:"टमाटर क्यान",   id:"Tomat kaleng",    zh:"番茄罐头",ko:"토마토 캔",   pt:"Tomate em lata",     th:"มะเขือเทศกระป๋อง",zhTW:"番茄罐頭"  },
  "さば缶":      { en:"Canned Mackerel", vi:"Cá thu hộp",    my:"ငါးကံ့ကော်ဗူး", ne:"म्याकेरेल क्यान",id:"Makarel kaleng", zh:"鲭鱼罐头",ko:"고등어 캔",   pt:"Cavala em lata",     th:"ปลาแมคเคอเรลกระป๋อง",zhTW:"鯖魚罐頭"},
  "大豆水煮":    { en:"Boiled Soybeans", vi:"Đậu nành luộc", my:"ပဲပြောင်ကျက်",  ne:"उमालेको सोयाबिन",id:"Kedelai rebus",  zh:"熟大豆",  ko:"삶은 콩",     pt:"Soja cozida",        th:"ถั่วเหลืองต้ม",  zhTW:"水煮大豆"    },
  "はちみつ":    { en:"Honey",           vi:"Mật ong",       my:"ပျားရည်",        ne:"मह",             id:"Madu",            zh:"蜂蜜",    ko:"꿀",          pt:"Mel",                th:"น้ำผึ้ง",       zhTW:"蜂蜜"        },

  // ── レトルト ──────────────────────────────────────────────
  "パックご飯":      { en:"Packaged Rice",    vi:"Cơm đóng gói",   my:"ထုပ်ပိုးထမင်း",ne:"प्याकेट भात",    id:"Nasi siap makan",   zh:"即食米饭",ko:"즉석밥",      pt:"Arroz embalado",      th:"ข้าวสำเร็จรูป", zhTW:"即食白飯"    },
  "レトルトカレー":  { en:"Curry Pouch",      vi:"Cà ri túi",      my:"ကာရီထုပ်",     ne:"तयारी करी",      id:"Kari instan",       zh:"速食咖喱",ko:"레토르트카레",pt:"Curry instantâneo",   th:"แกงกะหรี่สำเร็จรูป",zhTW:"即食咖哩"},
  "インスタントラーメン":{ en:"Instant Ramen", vi:"Mì ăn liền",    my:"ချက်ချင်းမုန့်",ne:"तुरन्त नुडल",   id:"Mi instan",         zh:"方便面",  ko:"라면",        pt:"Macarrão instantâneo",th:"บะหมี่กึ่งสำเร็จรูป",zhTW:"泡麵"},
  "パスタソース":    { en:"Pasta Sauce",      vi:"Sốt mì ống",     my:"ပဿတာဆော်",    ne:"पास्ता सस",      id:"Saus pasta",        zh:"意面酱",  ko:"파스타 소스", pt:"Molho para massa",    th:"ซอสพาสต้า",    zhTW:"義大利麵醬"  },

  // ── 冷凍品 ──────────────────────────────────────────────
  "冷凍餃子":      { en:"Frozen Gyoza",      vi:"Há cảo đông lạnh",my:"အေးခဲကြော်",  ne:"जमेको ड्याम्पलिङ",id:"Gyoza beku",      zh:"冷冻饺子",ko:"냉동 만두",   pt:"Gyoza congelado",     th:"เกี๊ยวแช่แข็ง",zhTW:"冷凍餃子"    },
  "冷凍枝豆":      { en:"Frozen Edamame",    vi:"Đậu đông lạnh",  my:"အေးခဲပဲ",      ne:"जमेको एडामामे",  id:"Edamame beku",    zh:"冷冻毛豆",ko:"냉동 에다마메",pt:"Edamame congelado",   th:"ถั่วแช่แข็ง",  zhTW:"冷凍毛豆"    },
  "冷凍唐揚げ":    { en:"Frozen Fried Chicken",vi:"Gà chiên đông lạnh",my:"အေးခဲကြောကြက်",ne:"जमेको फ्राइड चिकन",id:"Ayam goreng beku",zh:"冷冻炸鸡",ko:"냉동 치킨",  pt:"Frango frito congelado",th:"ไก่ทอดแช่แข็ง",zhTW:"冷凍炸雞"  },
  "冷凍コーン":    { en:"Frozen Corn",       vi:"Ngô đông lạnh",  my:"အေးခဲပြောင်း", ne:"जमेको मकै",      id:"Jagung beku",     zh:"冷冻玉米",ko:"냉동 옥수수",  pt:"Milho congelado",     th:"ข้าวโพดแช่แข็ง",zhTW:"冷凍玉米"  },
  "冷凍ほうれん草":{ en:"Frozen Spinach",    vi:"Rau bina đông lạnh",my:"အေးခဲဟင်းနုနယ်",ne:"जमेको पालक",  id:"Bayam beku",      zh:"冷冻菠菜",ko:"냉동 시금치",  pt:"Espinafre congelado", th:"ผักโขมแช่แข็ง",zhTW:"冷凍菠菜"  },
  "冷凍うどん":    { en:"Frozen Udon",       vi:"Mì udon đông lạnh",my:"အေးခဲဥဒန်",  ne:"जमेको उडन",      id:"Udon beku",       zh:"冷冻乌冬",ko:"냉동 우동",    pt:"Udon congelado",      th:"อุด้งแช่แข็ง", zhTW:"冷凍烏龍麵"  },
  "アイスクリーム":{ en:"Ice Cream",         vi:"Kem",            my:"ရေခဲမုန့်",    ne:"आइसक्रिम",       id:"Es krim",         zh:"冰淇淋",  ko:"아이스크림",  pt:"Sorvete",             th:"ไอศกรีม",      zhTW:"冰淇淋"      },

  // ── 飲み物 ──────────────────────────────────────────────
  "ミネラルウォーター":{ en:"Mineral Water",vi:"Nước khoáng",   my:"မိနရယ်ရေ",     ne:"खनिज पानी",      id:"Air mineral",     zh:"矿泉水",  ko:"생수",        pt:"Água mineral",        th:"น้ำแร่",        zhTW:"礦泉水"      },
  "お茶":          { en:"Green Tea",       vi:"Trà xanh",       my:"လက်ဖက်ရည်",    ne:"हरियो चिया",     id:"Teh hijau",       zh:"绿茶",    ko:"녹차",        pt:"Chá verde",           th:"ชาเขียว",       zhTW:"綠茶"        },
  "コーヒー":      { en:"Coffee",          vi:"Cà phê",         my:"ကော်ဖီ",        ne:"कफी",             id:"Kopi",            zh:"咖啡",    ko:"커피",        pt:"Café",                th:"กาแฟ",          zhTW:"咖啡"        },
  "オレンジジュース":{ en:"Orange Juice",  vi:"Nước cam",       my:"လိမ္မော်ရည်",   ne:"सुन्तलाको रस",   id:"Jus jeruk",       zh:"橙汁",    ko:"오렌지 주스", pt:"Suco de laranja",     th:"น้ำส้ม",        zhTW:"柳橙汁"      },
};

export function translateStaple(jaName: string, lang: string): string {
  if (lang === "ja") return jaName;
  return T[jaName]?.[lang as L] ?? jaName;
}

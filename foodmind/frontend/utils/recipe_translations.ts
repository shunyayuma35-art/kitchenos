// レシピ翻訳モジュール — 独立モジュール（既存コードに影響なし）
// 既存の i18n.ts の T インターフェース・キーとは完全に分離
// UI接続は後付け可能。このファイルをインポートするだけで使える。
//
// 使い方:
//   import { rt } from "@/utils/recipe_translations";
//   rt("nutrition.calories", lang)  → "Calories" / "カロリー" / "Kalori" ...

import type { Lang } from "@/lib/i18n";
import type { Recipe } from "@/lib/api";

// ── 型定義 ────────────────────────────────────────────────────
type LangMap = Record<Lang, string>;

// ── 栄養ラベル ────────────────────────────────────────────────
// RecipeCard.tsx の展開エリアにある日本語固定ラベルを多言語化するためのテーブル
export const NUTRITION_LABEL_T: Record<string, LangMap> = {
  "nutrition.calories": {
    ja:      "カロリー",
    en:      "Calories",
    vi:      "Calo",
    my:      "ကယ်လိုရီ",
    ne:      "क्यालोरी",
    id:      "Kalori",
    zh:      "卡路里",
    ko:      "칼로리",
    pt:      "Calorias",
    th:      "แคลอรี่",
    "zh-TW": "卡路里",
  },
  "nutrition.protein": {
    ja:      "たんぱく質",
    en:      "Protein",
    vi:      "Protein",
    my:      "ပရိုတင်း",
    ne:      "प्रोटिन",
    id:      "Protein",
    zh:      "蛋白质",
    ko:      "단백질",
    pt:      "Proteína",
    th:      "โปรตีน",
    "zh-TW": "蛋白質",
  },
  "nutrition.fat": {
    ja:      "脂質",
    en:      "Fat",
    vi:      "Chất béo",
    my:      "အဆီ",
    ne:      "वसा",
    id:      "Lemak",
    zh:      "脂肪",
    ko:      "지방",
    pt:      "Gordura",
    th:      "ไขมัน",
    "zh-TW": "脂肪",
  },
  "nutrition.carbs": {
    ja:      "炭水化物",
    en:      "Carbs",
    vi:      "Tinh bột",
    my:      "ကာဗိုဟိုက်ဒရိတ်",
    ne:      "कार्बोहाइड्रेट",
    id:      "Karbohidrat",
    zh:      "碳水化合物",
    ko:      "탄수화물",
    pt:      "Carboidratos",
    th:      "คาร์โบไฮเดรต",
    "zh-TW": "碳水化合物",
  },
};

// ── あと1品・補完提案 ─────────────────────────────────────────
// page.tsx の suggestSideDish() が返す4パターンの多言語版
// UI接続時: suggestSideDish(ingredients, lang) に lang 引数を追加して rt() を呼ぶだけ
export const SIDE_DISH_T: Record<string, LangMap> = {
  "side_dish.carb": {
    ja:      "あと1品：ご飯 or パン",
    en:      "+1 dish: Rice or Bread",
    vi:      "+1 món: Cơm hoặc Bánh mì",
    my:      "+၁ ပွဲ: ထမင်း သို့မဟုတ် မုန့်",
    ne:      "+१ थप: भात वा रोटी",
    id:      "+1 lauk: Nasi atau Roti",
    zh:      "再加一品：米饭或面包",
    ko:      "+1품: 밥 또는 빵",
    pt:      "+1 prato: Arroz ou Pão",
    th:      "+1 จาน: ข้าว หรือขนมปัง",
    "zh-TW": "再加一品：飯或麵包",
  },
  "side_dish.protein": {
    ja:      "あと1品：卵 or 豆腐（切るだけ）",
    en:      "+1 dish: Egg or Tofu (ready in seconds)",
    vi:      "+1 món: Trứng hoặc Đậu phụ",
    my:      "+၁ ပွဲ: ဥ သို့မဟုတ် တိုဖူး",
    ne:      "+१ थप: अण्डा वा टोफू",
    id:      "+1 lauk: Telur atau Tahu",
    zh:      "再加一品：鸡蛋或豆腐",
    ko:      "+1품: 계란 또는 두부",
    pt:      "+1 prato: Ovo ou Tofu",
    th:      "+1 จาน: ไข่ หรือเต้าหู้",
    "zh-TW": "再加一品：雞蛋或豆腐",
  },
  "side_dish.veggie": {
    ja:      "あと1品：トマト or サラダ（切るだけ）",
    en:      "+1 dish: Tomato or Salad (just slice)",
    vi:      "+1 món: Cà chua hoặc Salad",
    my:      "+၁ ပွဲ: ခရမ်းချဉ် သို့မဟုတ် ဆလတ်",
    ne:      "+१ थप: टमाटर वा सलाद",
    id:      "+1 lauk: Tomat atau Salad",
    zh:      "再加一品：番茄或沙拉",
    ko:      "+1품: 토마토 또는 샐러드",
    pt:      "+1 prato: Tomate ou Salada",
    th:      "+1 จาน: มะเขือเทศ หรือสลัด",
    "zh-TW": "再加一品：番茄或沙拉",
  },
  "side_dish.soup": {
    ja:      "あと1品：みそ汁 or スープ（温めるだけ）",
    en:      "+1 dish: Miso Soup or Soup (just heat)",
    vi:      "+1 món: Canh miso hoặc Súp",
    my:      "+၁ ပွဲ: မိဆိုး ဟင်းချို သို့မဟုတ် ဟင်းချို",
    ne:      "+१ थप: मिसो सूप वा सूप",
    id:      "+1 lauk: Sup Miso atau Sup",
    zh:      "再加一品：味噌汤或汤",
    ko:      "+1품: 된장국 또는 수프",
    pt:      "+1 prato: Sopa de Missô ou Sopa",
    th:      "+1 จาน: ซุปมิโซะ หรือซุป",
    "zh-TW": "再加一品：味噌湯或湯",
  },
};

// ── レシピタイトル翻訳テーブル ────────────────────────────────
// キー命名規則: "recipe.<snake_case_ja_phonetic>"
// AI生成レシピのタイトルと完全一致する場合のみ翻訳が適用される
// 未収録タイトルは翻訳せずそのまま表示（AI側が既に翻訳済みの場合も安全）
export const RECIPE_TITLE_T: Record<string, LangMap> = {

  // ── フォールバックレシピ（page.tsx ハードコード分） ──────────
  "recipe.egg_rice": {
    ja:      "卵かけご飯",
    en:      "Rice with Raw Egg (TKG)",
    vi:      "Cơm trộn trứng sống",
    my:      "ဥနှင့် ထမင်း",
    ne:      "अण्डासहित भात",
    id:      "Nasi Telur Mentah",
    zh:      "鸡蛋拌饭",
    ko:      "날달걀밥 (TKG)",
    pt:      "Arroz com Ovo Cru",
    th:      "ข้าวราดไข่ดิบ",
    "zh-TW": "雞蛋拌飯",
  },
  "recipe.simple_fried_egg": {
    ja:      "焼くだけ！シンプル目玉焼き",
    en:      "Just Fry! Simple Fried Egg",
    vi:      "Chỉ chiên thôi! Trứng ốp la đơn giản",
    my:      "ကြော်လိုက်ရုံ! ရိုးရိုး ကြော်ဥ",
    ne:      "भुट्नुस मात्र! सरल फ्राइड अण्डा",
    id:      "Tinggal Goreng! Telur Mata Sapi Sederhana",
    zh:      "只需煎！简单煎蛋",
    ko:      "굽기만! 간단 계란후라이",
    pt:      "Só Fritar! Ovo Frito Simples",
    th:      "แค่ทอด! ไข่ดาวง่ายๆ",
    "zh-TW": "只需煎！簡單煎蛋",
  },
  "recipe.packed_rice_set": {
    ja:      "温めるだけ！パックご飯定食",
    en:      "Just Microwave! Packed Rice Meal",
    vi:      "Chỉ hâm nóng! Cơm hộp",
    my:      "ရှောင်းထောင်းလိုက်ရုံ! ထုပ်ထမင်း",
    ne:      "तताउनुस मात्र! प्याकेट भात",
    id:      "Tinggal Panaskan! Nasi Kotak Siap Makan",
    zh:      "加热即可！便当套餐",
    ko:      "전자레인지만! 즉석밥 정식",
    pt:      "Só Aquecer! Marmita de Arroz",
    th:      "แค่อุ่น! ข้าวกล่องพร้อมทาน",
    "zh-TW": "加熱即可！便當套餐",
  },

  // ── よく生成されるレシピ（日本語 ja 設定時の典型出力） ────────
  "recipe.pork_cabbage_salt": {
    ja:      "豚バラとキャベツの塩炒め",
    en:      "Stir-fried Pork Belly and Cabbage with Salt",
    vi:      "Thịt ba chỉ xào bắp cải muối",
    my:      "ဝက်ဆယ်ကြောင်းနှင့် ဂေါ်ဖီထုပ် ဆားကြော်",
    ne:      "सुँगुरको मासु र बन्दाकोबी नुन तारेको",
    id:      "Tumis Daging Babi dan Kubis dengan Garam",
    zh:      "猪五花和卷心菜盐炒",
    ko:      "돼지삼겹살 양배추 소금볶음",
    pt:      "Barriga de Porco com Repolho no Sal",
    th:      "ผัดหมูสามชั้นกับกะหล่ำปลีใส่เกลือ",
    "zh-TW": "豬五花和高麗菜鹽炒",
  },
  "recipe.chicken_teriyaki": {
    ja:      "鶏もも肉の照り焼き",
    en:      "Chicken Thigh Teriyaki",
    vi:      "Đùi gà sốt teriyaki",
    my:      "ကြက်ပေါင် တဲရိယာကိ",
    ne:      "कुखुराको तिघ्रा टेरियाकी",
    id:      "Paha Ayam Teriyaki",
    zh:      "鸡腿照烧",
    ko:      "닭다리살 데리야키",
    pt:      "Coxa de Frango Teriyaki",
    th:      "ต้นขาไก่เทอริยากิ",
    "zh-TW": "雞腿照燒",
  },
  "recipe.chicken_breast_ponzu": {
    ja:      "鶏むね肉のポン酢和え",
    en:      "Chicken Breast with Ponzu Dressing",
    vi:      "Ức gà trộn nước chấm ponzu",
    my:      "ကြက်ရင်ဘတ် ပွန်ဇူ ဆော့",
    ne:      "कुखुराको छाती पोन्जु सस",
    id:      "Dada Ayam Saus Ponzu",
    zh:      "鸡胸肉柚子醋拌",
    ko:      "닭가슴살 폰즈 무침",
    pt:      "Peito de Frango com Molho Ponzu",
    th:      "อกไก่ปรุงซอสพอนซุ",
    "zh-TW": "雞胸肉柚子醋拌",
  },
  "recipe.stir_fried_veggies": {
    ja:      "野菜炒め",
    en:      "Stir-fried Vegetables",
    vi:      "Rau xào",
    my:      "ဟင်းသီးဟင်းရွက် ကြော်",
    ne:      "तरकारी भुटेको",
    id:      "Tumis Sayuran",
    zh:      "炒蔬菜",
    ko:      "야채볶음",
    pt:      "Legumes Salteados",
    th:      "ผัดผัก",
    "zh-TW": "炒蔬菜",
  },
  "recipe.egg_fried_rice": {
    ja:      "卵炒飯",
    en:      "Egg Fried Rice",
    vi:      "Cơm chiên trứng",
    my:      "ဥကြော်ထမင်း",
    ne:      "अण्डा फ्राइड राइस",
    id:      "Nasi Goreng Telur",
    zh:      "蛋炒饭",
    ko:      "계란볶음밥",
    pt:      "Arroz Frito com Ovo",
    th:      "ข้าวผัดไข่",
    "zh-TW": "蛋炒飯",
  },
  "recipe.chahan": {
    ja:      "チャーハン",
    en:      "Japanese Fried Rice",
    vi:      "Cơm chiên kiểu Nhật",
    my:      "ဂျပန် ကြော်ထမင်း",
    ne:      "जापानी फ्राइड राइस",
    id:      "Nasi Goreng Jepang",
    zh:      "炒饭",
    ko:      "볶음밥",
    pt:      "Arroz Frito Japonês",
    th:      "ข้าวผัดญี่ปุ่น",
    "zh-TW": "炒飯",
  },
  "recipe.tonjiru": {
    ja:      "豚汁",
    en:      "Tonjiru (Pork Miso Soup)",
    vi:      "Súp miso thịt heo",
    my:      "ဝက်သား မိဆိုး ဟင်းချို",
    ne:      "सुँगुरको मिसो सूप",
    id:      "Sup Miso Daging Babi",
    zh:      "猪肉味噌汤",
    ko:      "돼지고기 된장국",
    pt:      "Sopa de Porco com Missô",
    th:      "ซุปหมูมิโซะ",
    "zh-TW": "豬肉味噌湯",
  },
  "recipe.nikujaga": {
    ja:      "肉じゃが",
    en:      "Nikujaga (Meat and Potato Stew)",
    vi:      "Hầm thịt khoai tây kiểu Nhật",
    my:      "ဂျပန် အသားကြောင်း ချို",
    ne:      "जापानी आलु मासु स्टु",
    id:      "Nikujaga (Semur Daging Kentang)",
    zh:      "日式炖肉土豆",
    ko:      "니쿠자가 (고기감자조림)",
    pt:      "Nikujaga (Ensopado de Carne e Batata)",
    th:      "นิคุจากะ (สตูว์เนื้อมันฝรั่ง)",
    "zh-TW": "日式燉肉馬鈴薯",
  },
  "recipe.miso_soup_veggie": {
    ja:      "野菜たっぷり味噌汁",
    en:      "Hearty Vegetable Miso Soup",
    vi:      "Súp miso nhiều rau",
    my:      "ဟင်းသီးဟင်းရွက် မိဆိုး ဟင်းချို",
    ne:      "तरकारी भरिएको मिसो सूप",
    id:      "Sup Miso Kaya Sayuran",
    zh:      "蔬菜丰富的味噌汤",
    ko:      "채소 듬뿍 된장국",
    pt:      "Sopa de Missô com Muitos Legumes",
    th:      "ซุปมิโซะผักเยอะ",
    "zh-TW": "蔬菜豐富的味噌湯",
  },
  "recipe.tofu_miso_soup": {
    ja:      "豆腐の味噌汁",
    en:      "Tofu Miso Soup",
    vi:      "Súp miso đậu hũ",
    my:      "တိုဖူး မိဆိုး ဟင်းချို",
    ne:      "टोफू मिसो सूप",
    id:      "Sup Miso Tahu",
    zh:      "豆腐味噌汤",
    ko:      "두부 된장국",
    pt:      "Sopa de Missô com Tofu",
    th:      "ซุปมิโซะเต้าหู้",
    "zh-TW": "豆腐味噌湯",
  },
  "recipe.tuna_cucumber_salad": {
    ja:      "きゅうりとツナのサラダ",
    en:      "Cucumber and Tuna Salad",
    vi:      "Salad dưa leo và cá ngừ",
    my:      "သခွားနှင့် တူနာ ဆလတ်",
    ne:      "काँक्रो र टुना सलाद",
    id:      "Salad Timun dan Tuna",
    zh:      "黄瓜金枪鱼沙拉",
    ko:      "오이 참치 샐러드",
    pt:      "Salada de Pepino com Atum",
    th:      "สลัดแตงกวาและทูน่า",
    "zh-TW": "黃瓜鮪魚沙拉",
  },
  "recipe.tuna_stir_fry": {
    ja:      "ツナと野菜の炒め物",
    en:      "Tuna and Vegetable Stir-fry",
    vi:      "Cá ngừ và rau xào",
    my:      "တူနာနှင့် ဟင်းသီးဟင်းရွက် ကြော်",
    ne:      "टुना र तरकारी भुटेको",
    id:      "Tumis Tuna dan Sayuran",
    zh:      "金枪鱼蔬菜炒",
    ko:      "참치 야채볶음",
    pt:      "Refogado de Atum com Legumes",
    th:      "ผัดทูน่าและผัก",
    "zh-TW": "鮪魚蔬菜炒",
  },
  "recipe.salmon_foil": {
    ja:      "鮭のホイル焼き",
    en:      "Foil-baked Salmon",
    vi:      "Cá hồi nướng giấy bạc",
    my:      "ဆော်မွန် ဖိုင်းထုပ် ဖုတ်",
    ne:      "फोइलमा पकाएको साल्मन",
    id:      "Salmon Panggang Foil",
    zh:      "三文鱼锡纸烤",
    ko:      "연어 호일 구이",
    pt:      "Salmão Assado no Papel Alumínio",
    th:      "แซลมอนห่อฟอยล์อบ",
    "zh-TW": "鮭魚錫箔烤",
  },
  "recipe.simple_omelette": {
    ja:      "シンプルオムレツ",
    en:      "Simple Omelette",
    vi:      "Trứng cuộn đơn giản",
    my:      "ရိုးရိုး အိုင်မလက်",
    ne:      "सरल ओमलेट",
    id:      "Omelet Sederhana",
    zh:      "简单煎蛋卷",
    ko:      "간단 오믈렛",
    pt:      "Omelete Simples",
    th:      "ออมเล็ตง่ายๆ",
    "zh-TW": "簡單煎蛋捲",
  },
  "recipe.yakisoba": {
    ja:      "焼きそば",
    en:      "Yakisoba (Stir-fried Noodles)",
    vi:      "Mì xào Nhật",
    my:      "ဂျပန် ကြော်ချက် ခေါက်ဆွဲ",
    ne:      "जापानी फ्राइड नूडल",
    id:      "Yakisoba (Mi Goreng Jepang)",
    zh:      "日式炒面",
    ko:      "야키소바 (볶음면)",
    pt:      "Yakisoba (Macarrão Frito)",
    th:      "ยากิโซบะ (เส้นผัด)",
    "zh-TW": "日式炒麵",
  },
  "recipe.saba_miso": {
    ja:      "さば缶の味噌煮",
    en:      "Canned Mackerel in Miso Sauce",
    vi:      "Cá thu hộp kho miso",
    my:      "မင်းငါး ဗူး မိဆိုး ချက်",
    ne:      "डब्बाबन्द म्याकेरेल मिसो",
    id:      "Makarel Kalengan Saus Miso",
    zh:      "沙丁鱼罐头味噌炖",
    ko:      "고등어 통조림 된장조림",
    pt:      "Cavala Enlatada com Missô",
    th:      "ปลาแมคเคอเรลกระป๋องมิโซะ",
    "zh-TW": "鯖魚罐頭味噌煮",
  },
  "recipe.potato_salad": {
    ja:      "ポテトサラダ",
    en:      "Potato Salad",
    vi:      "Salad khoai tây",
    my:      "အာလူး ဆလတ်",
    ne:      "आलुको सलाद",
    id:      "Salad Kentang",
    zh:      "土豆沙拉",
    ko:      "감자 샐러드",
    pt:      "Salada de Batata",
    th:      "สลัดมันฝรั่ง",
    "zh-TW": "馬鈴薯沙拉",
  },
  "recipe.kinpira": {
    ja:      "大根とにんじんのきんぴら",
    en:      "Kinpira Daikon and Carrot",
    vi:      "Rau củ xào vừng kiểu Nhật",
    my:      "ဒိုင်ကွန်နှင့် မြစ်ကြောင်း ကင်းပီရာ",
    ne:      "मुला र गाजरको किम्पिरा",
    id:      "Kinpira Lobak dan Wortel",
    zh:      "萝卜和胡萝卜的金平煮",
    ko:      "무와 당근 킨피라",
    pt:      "Kinpira de Nabo e Cenoura",
    th:      "คินปิระหัวไชเท้าและแครอท",
    "zh-TW": "蘿蔔和紅蘿蔔金平煮",
  },
  "recipe.spinach_saute": {
    ja:      "ほうれん草のソテー",
    en:      "Sautéed Spinach",
    vi:      "Rau bina xào",
    my:      "ဟင်းနုနွယ် ကြော်",
    ne:      "पालकको भुटुन",
    id:      "Bayam Tumis",
    zh:      "菠菜炒",
    ko:      "시금치 소테",
    pt:      "Espinafre Salteado",
    th:      "ผัดผักโขม",
    "zh-TW": "菠菜炒",
  },
  "recipe.gyoza_pan_fried": {
    ja:      "冷凍餃子の焼き方",
    en:      "Pan-fried Frozen Gyoza",
    vi:      "Há cảo đông lạnh chiên áp chảo",
    my:      "အေးခဲ ကြော်ဂျောဇာ",
    ne:      "फ्रोजन ग्योजा तवामा",
    id:      "Gyoza Beku Goreng Wajan",
    zh:      "冷冻饺子煎法",
    ko:      "냉동 군만두 굽기",
    pt:      "Gyoza Congelado na Frigideira",
    th:      "เกี๊ยวแช่แข็งทอดกระทะ",
    "zh-TW": "冷凍餃子的煎法",
  },
  "recipe.eggplant_tomato": {
    ja:      "なすとトマトの炒め物",
    en:      "Stir-fried Eggplant and Tomato",
    vi:      "Cà tím và cà chua xào",
    my:      "ခရမ်းနှင့် ခရမ်းချဉ်သီး ကြော်",
    ne:      "भण्टा र टमाटर भुटेको",
    id:      "Tumis Terong dan Tomat",
    zh:      "茄子番茄炒",
    ko:      "가지 토마토 볶음",
    pt:      "Berinjela com Tomate Salteados",
    th:      "ผัดมะเขือและมะเขือเทศ",
    "zh-TW": "茄子番茄炒",
  },
  "recipe.bacon_veggie_saute": {
    ja:      "ベーコンと野菜のソテー",
    en:      "Bacon and Vegetable Sauté",
    vi:      "Thịt xông khói xào rau",
    my:      "ဘေကွန်နှင့် ဟင်းသီးဟင်းရွက် ကြော်",
    ne:      "बेकन र तरकारी सोते",
    id:      "Tumis Bacon dan Sayuran",
    zh:      "培根蔬菜炒",
    ko:      "베이컨 야채 소테",
    pt:      "Bacon com Legumes Salteados",
    th:      "เบคอนและผักผัด",
    "zh-TW": "培根蔬菜炒",
  },
  "recipe.pork_spinach": {
    ja:      "豚こまとほうれん草の炒め物",
    en:      "Pork and Spinach Stir-fry",
    vi:      "Thịt heo xào rau bina",
    my:      "ဝက်ကြော်နှင့် ဟင်းနုနွယ် ကြော်",
    ne:      "सुँगुर र पालक भुटेको",
    id:      "Tumis Daging Babi dan Bayam",
    zh:      "猪碎肉菠菜炒",
    ko:      "돼지고기 시금치볶음",
    pt:      "Carne de Porco com Espinafre",
    th:      "ผัดหมูและผักโขม",
    "zh-TW": "豬碎肉菠菜炒",
  },
  "recipe.carrot_onion_soup": {
    ja:      "にんじんと玉ねぎのスープ",
    en:      "Carrot and Onion Soup",
    vi:      "Súp cà rốt và hành tây",
    my:      "မြစ်ကြောင်းနှင့် ကြက်သွန်နီ ဟင်းချို",
    ne:      "गाजर र प्याजको सूप",
    id:      "Sup Wortel dan Bawang Bombay",
    zh:      "胡萝卜洋葱汤",
    ko:      "당근 양파 수프",
    pt:      "Sopa de Cenoura e Cebola",
    th:      "ซุปแครอทและหัวหอม",
    "zh-TW": "紅蘿蔔洋蔥湯",
  },
};

// ── 全テーブル統合 ────────────────────────────────────────────
const ALL_T = {
  ...NUTRITION_LABEL_T,
  ...SIDE_DISH_T,
  ...RECIPE_TITLE_T,
};

// ── ヘルパー関数 ──────────────────────────────────────────────

/**
 * 翻訳キーと言語コードを渡すと翻訳済み文字列を返す。
 * 未収録キー → キー文字列をそのまま返す。
 * 未収録言語 → 日本語（ja）にフォールバック。
 *
 * @example
 *   rt("nutrition.calories", "en")  // → "Calories"
 *   rt("side_dish.carb",     "vi")  // → "+1 món: Cơm hoặc Bánh mì"
 *   rt("recipe.egg_rice",    "ko")  // → "날달걀밥 (TKG)"
 */
export function rt(key: string, lang: Lang): string {
  const record = ALL_T[key as keyof typeof ALL_T];
  if (!record) return key;
  const r = record as Record<string, string>;
  return r[lang] ?? r["ja"] ?? key;
}

/**
 * 日本語レシピタイトルから翻訳キーを逆引きする。
 * 収録外タイトルは null を返す（AI翻訳済み or 未収録）。
 *
 * @example
 *   findTitleKey("卵かけご飯")  // → "recipe.egg_rice"
 *   findTitleKey("謎のレシピ") // → null
 */
export function findTitleKey(jaTitle: string): string | null {
  return (
    Object.keys(RECIPE_TITLE_T).find(
      (k) => RECIPE_TITLE_T[k]["ja"] === jaTitle
    ) ?? null
  );
}

/**
 * レシピタイトルを現在言語に翻訳する。
 * テーブル未収録、または lang==="ja" の場合は元のタイトルをそのまま返す。
 * AI生成済みのタイトル（lang!="ja"時に生成されたもの）は上書きしない。
 *
 * @example
 *   translateTitle("卵かけご飯", "en")  // → "Rice with Raw Egg (TKG)"
 *   translateTitle("謎のレシピ",  "en")  // → "謎のレシピ"（未収録 → そのまま）
 */
export function translateTitle(jaTitle: string, lang: Lang): string {
  if (lang === "ja") return jaTitle;
  const key = findTitleKey(jaTitle);
  return key ? rt(key, lang) : jaTitle;
}

/**
 * lang 固定のヘルパーを返す高階関数。
 * コンポーネント内で rt(key, lang) を何度も呼ぶ代わりに使える。
 *
 * @example
 *   const rT = makeRt(lang);
 *   rT("nutrition.calories")  // → "Calories"
 */
export function makeRt(lang: Lang): (key: string) => string {
  return (key: string) => rt(key, lang);
}

/**
 * Recipe オブジェクトを現在言語に翻訳する（同期・安全）。
 *
 * 優先順位：
 *  1. フォールバックレシピ（FALLBACK_DATA に収録）→ タイトル・材料・手順すべて翻訳
 *  2. AI生成レシピ（RECIPE_TITLE_T にタイトルが収録）→ タイトルのみ翻訳
 *  3. 未収録 → そのまま返す（AI側が既に正しい言語で生成済みの場合）
 *
 * page.tsx の useEffect から呼ぶ想定:
 *   setRecipes(prev => prev.map(r => translateRecipe(r, lang)));
 */
export function translateRecipe(recipe: Recipe, lang: Lang): Recipe {
  // ── フォールバックレシピ：全フィールドを翻訳済み版に差し替え ──
  for (const fallbackRecipes of Object.values(FALLBACK_DATA) as Recipe[][]) {
    const idx = fallbackRecipes.findIndex((r) => r.title === recipe.title);
    if (idx !== -1) {
      return (FALLBACK_DATA[lang] ?? FALLBACK_DATA["ja"])[idx] ?? recipe;
    }
  }

  // ── AI生成レシピ：タイトルのみ翻訳（材料・手順は保持） ────────
  // AI が lang 指定で生成した場合、材料・手順は既に正しい言語にある
  const newTitle = translateTitle(recipe.title, lang);
  if (newTitle === recipe.title) return recipe;
  return { ...recipe, title: newTitle };
}

// ── フォールバックレシピ（API失敗時の表示用） ─────────────────
// タイトル・材料・手順をすべて11言語で保持
// page.tsx の try/catch フォールバックで使用する

const FALLBACK_DATA: Record<Lang, Recipe[]> = {
  ja: [
    {
      title: "卵かけご飯", type: "時短", cookTime: "2分", difficulty: "簡単",
      ingredients: ["卵 1個", "ご飯 1膳", "醤油 少々"],
      missingIngredients: [], substitutions: [],
      steps: ["ご飯を茶碗に盛る", "生卵を割りかける", "醤油をかけて完成"],
    },
    {
      title: "焼くだけ！シンプル目玉焼き", type: "時短", cookTime: "5分", difficulty: "簡単",
      ingredients: ["卵 2個", "塩 少々", "サラダ油 少々"],
      missingIngredients: [], substitutions: [],
      steps: ["フライパンに油をひいて中火にする", "卵を静かに割り入れる", "蓋をして2分蒸らして完成"],
    },
    {
      title: "温めるだけ！パックご飯定食", type: "節約", cookTime: "3分", difficulty: "簡単",
      ingredients: ["パックご飯 1個", "冷蔵庫の残り物 適量"],
      missingIngredients: [], substitutions: [],
      steps: ["パックご飯を電子レンジで2分加熱する", "皿に盛り付ける", "冷蔵庫にあるおかずを添えて完成"],
    },
  ],
  en: [
    {
      title: "Rice with Raw Egg (TKG)", type: "時短", cookTime: "2 min", difficulty: "簡単",
      ingredients: ["1 egg", "1 bowl of rice", "soy sauce to taste"],
      missingIngredients: [], substitutions: [],
      steps: ["Serve rice in a bowl", "Crack a raw egg on top", "Drizzle with soy sauce and enjoy"],
    },
    {
      title: "Just Fry! Simple Fried Egg", type: "時短", cookTime: "5 min", difficulty: "簡単",
      ingredients: ["2 eggs", "salt to taste", "a little cooking oil"],
      missingIngredients: [], substitutions: [],
      steps: ["Heat oil in a pan over medium heat", "Gently crack eggs into the pan", "Cover and steam for 2 minutes"],
    },
    {
      title: "Just Microwave! Packed Rice Meal", type: "節約", cookTime: "3 min", difficulty: "簡単",
      ingredients: ["1 pack of microwaveable rice", "leftovers from the fridge"],
      missingIngredients: [], substitutions: [],
      steps: ["Microwave the rice for 2 minutes", "Plate it up", "Add leftover sides from the fridge and serve"],
    },
  ],
  vi: [
    {
      title: "Cơm trộn trứng sống", type: "時短", cookTime: "2 phút", difficulty: "簡単",
      ingredients: ["1 quả trứng", "1 bát cơm", "xì dầu vừa đủ"],
      missingIngredients: [], substitutions: [],
      steps: ["Múc cơm vào bát", "Đập trứng sống lên trên", "Rưới xì dầu và thưởng thức"],
    },
    {
      title: "Chỉ chiên thôi! Trứng ốp la đơn giản", type: "時短", cookTime: "5 phút", difficulty: "簡単",
      ingredients: ["2 quả trứng", "muối vừa đủ", "một ít dầu ăn"],
      missingIngredients: [], substitutions: [],
      steps: ["Đổ dầu vào chảo và đun lửa vừa", "Nhẹ nhàng đập trứng vào chảo", "Đậy nắp và đun 2 phút"],
    },
    {
      title: "Chỉ hâm nóng! Cơm hộp", type: "節約", cookTime: "3 phút", difficulty: "簡単",
      ingredients: ["1 gói cơm hộp", "đồ thừa trong tủ lạnh"],
      missingIngredients: [], substitutions: [],
      steps: ["Hâm cơm trong lò vi sóng 2 phút", "Bày ra đĩa", "Thêm đồ ăn thừa từ tủ lạnh"],
    },
  ],
  my: [
    {
      title: "ဥနှင့် ထမင်း", type: "時短", cookTime: "၂ မိနစ်", difficulty: "簡単",
      ingredients: ["ဥ ၁ လုံး", "ထမင်း ၁ ပန်းကန်", "ပဲငံပြာရည် အနည်းငယ်"],
      missingIngredients: [], substitutions: [],
      steps: ["ထမင်းကို ပန်းကန်ထဲ ထည့်ပါ", "ဥကို ဖောက်ပြီး ထည့်ပါ", "ပဲငံပြာရည် ဖြန်းပြီး စားပါ"],
    },
    {
      title: "ကြော်လိုက်ရုံ! ရိုးရိုး ကြော်ဥ", type: "時短", cookTime: "၅ မိနစ်", difficulty: "簡単",
      ingredients: ["ဥ ၂ လုံး", "ဆား အနည်းငယ်", "ဆီ အနည်းငယ်"],
      missingIngredients: [], substitutions: [],
      steps: ["ကြာသီးဆေးထဲ ဆီ ထည့်ပြီး မီးအလတ်တင်ပါ", "ဥကို ဖောက်ပြီး ထည့်ပါ", "အဖုံး ဖုံးပြီး ၂ မိနစ် ငုပ်ပါ"],
    },
    {
      title: "အပူပေးလိုက်ရုံ! ထုပ်ထမင်း", type: "節約", cookTime: "၃ မိနစ်", difficulty: "簡単",
      ingredients: ["ထုပ်ထမင်း ၁ ထုပ်", "ရေခဲသေတ္တာ ကျန်သောအစားအစာ"],
      missingIngredients: [], substitutions: [],
      steps: ["ထုပ်ထမင်းကို မိုက်ကရိုဝေ ၂ မိနစ် ပူပေးပါ", "ပန်းကန်ထဲ ထည့်ပါ", "ဟင်းများ ထည့်ပြီး စားပါ"],
    },
  ],
  ne: [
    {
      title: "अण्डासहित भात", type: "時短", cookTime: "२ मिनेट", difficulty: "簡単",
      ingredients: ["१ वटा अण्डा", "१ कचौरा भात", "सोया सस स्वादअनुसार"],
      missingIngredients: [], substitutions: [],
      steps: ["भातलाई कचौरामा राख्नुस्", "कच्चो अण्डा फुटाएर राख्नुस्", "सोया सस हाली खानुस्"],
    },
    {
      title: "भुट्नुस मात्र! सरल फ्राइड अण्डा", type: "時短", cookTime: "५ मिनेट", difficulty: "簡単",
      ingredients: ["२ वटा अण्डा", "नुन स्वादअनुसार", "थोरै तेल"],
      missingIngredients: [], substitutions: [],
      steps: ["तवामा तेल हालेर मध्यम आँचमा गरम गर्नुस्", "अण्डा बिस्तारै फुटाएर राख्नुस्", "बिर्को लगाएर २ मिनेट भाप दिनुस्"],
    },
    {
      title: "तताउनुस मात्र! प्याकेट भात", type: "節約", cookTime: "३ मिनेट", difficulty: "簡単",
      ingredients: ["प्याकेट भात १ वटा", "फ्रिजको बाँकी खाना"],
      missingIngredients: [], substitutions: [],
      steps: ["भातको प्याकेट माइक्रोवेभमा २ मिनेट तताउनुस्", "थालमा राख्नुस्", "फ्रिजको तरकारी थपेर खानुस्"],
    },
  ],
  id: [
    {
      title: "Nasi Telur Mentah", type: "時短", cookTime: "2 menit", difficulty: "簡単",
      ingredients: ["1 butir telur", "1 mangkuk nasi", "kecap asin secukupnya"],
      missingIngredients: [], substitutions: [],
      steps: ["Taruh nasi ke dalam mangkuk", "Pecahkan telur mentah di atasnya", "Tuangkan kecap dan nikmati"],
    },
    {
      title: "Tinggal Goreng! Telur Mata Sapi Sederhana", type: "時短", cookTime: "5 menit", difficulty: "簡単",
      ingredients: ["2 butir telur", "garam secukupnya", "sedikit minyak goreng"],
      missingIngredients: [], substitutions: [],
      steps: ["Panaskan minyak di wajan api sedang", "Pecahkan telur perlahan ke wajan", "Tutup dan kukus 2 menit"],
    },
    {
      title: "Tinggal Panaskan! Nasi Kotak Siap Makan", type: "節約", cookTime: "3 menit", difficulty: "簡単",
      ingredients: ["1 kemasan nasi siap saji", "sisa makanan dari kulkas"],
      missingIngredients: [], substitutions: [],
      steps: ["Panaskan nasi dalam microwave 2 menit", "Tata di atas piring", "Tambahkan lauk dari kulkas dan sajikan"],
    },
  ],
  zh: [
    {
      title: "鸡蛋拌饭", type: "時短", cookTime: "2分钟", difficulty: "簡単",
      ingredients: ["鸡蛋 1个", "米饭 1碗", "酱油 少许"],
      missingIngredients: [], substitutions: [],
      steps: ["将米饭盛入碗中", "打入生鸡蛋", "淋上酱油即可享用"],
    },
    {
      title: "只需煎！简单煎蛋", type: "時短", cookTime: "5分钟", difficulty: "簡単",
      ingredients: ["鸡蛋 2个", "盐 少许", "食用油 少许"],
      missingIngredients: [], substitutions: [],
      steps: ["平底锅倒油，中火加热", "轻轻打入鸡蛋", "盖上锅盖焖2分钟即成"],
    },
    {
      title: "加热即可！便当套餐", type: "節約", cookTime: "3分钟", difficulty: "簡単",
      ingredients: ["微波米饭 1包", "冰箱里的剩菜适量"],
      missingIngredients: [], substitutions: [],
      steps: ["将米饭放入微波炉加热2分钟", "盛入盘中", "搭配冰箱中的小菜即可"],
    },
  ],
  ko: [
    {
      title: "날달걀밥 (TKG)", type: "時短", cookTime: "2분", difficulty: "簡単",
      ingredients: ["계란 1개", "밥 1공기", "간장 약간"],
      missingIngredients: [], substitutions: [],
      steps: ["밥을 공기에 담는다", "날달걀을 깨서 올린다", "간장을 뿌려서 완성"],
    },
    {
      title: "굽기만! 간단 계란후라이", type: "時短", cookTime: "5분", difficulty: "簡単",
      ingredients: ["계란 2개", "소금 약간", "식용유 약간"],
      missingIngredients: [], substitutions: [],
      steps: ["프라이팬에 기름을 두르고 중불로 달군다", "달걀을 조심스럽게 깨 넣는다", "뚜껑을 덮고 2분 뜸 들이면 완성"],
    },
    {
      title: "전자레인지만! 즉석밥 정식", type: "節約", cookTime: "3분", difficulty: "簡単",
      ingredients: ["즉석밥 1개", "냉장고 남은 반찬 적당량"],
      missingIngredients: [], substitutions: [],
      steps: ["즉석밥을 전자레인지로 2분 가열한다", "그릇에 담는다", "냉장고 반찬을 곁들여 완성"],
    },
  ],
  pt: [
    {
      title: "Arroz com Ovo Cru", type: "時短", cookTime: "2 min", difficulty: "簡単",
      ingredients: ["1 ovo", "1 tigela de arroz", "shoyu a gosto"],
      missingIngredients: [], substitutions: [],
      steps: ["Sirva o arroz em uma tigela", "Quebre um ovo cru por cima", "Regue com shoyu e aproveite"],
    },
    {
      title: "Só Fritar! Ovo Frito Simples", type: "時短", cookTime: "5 min", difficulty: "簡単",
      ingredients: ["2 ovos", "sal a gosto", "um pouco de óleo"],
      missingIngredients: [], substitutions: [],
      steps: ["Aqueça o óleo em frigideira em fogo médio", "Quebre os ovos delicadamente", "Tampe e cozinhe no vapor por 2 minutos"],
    },
    {
      title: "Só Aquecer! Marmita de Arroz", type: "節約", cookTime: "3 min", difficulty: "簡単",
      ingredients: ["1 embalagem de arroz para micro-ondas", "sobras da geladeira a gosto"],
      missingIngredients: [], substitutions: [],
      steps: ["Aqueça o arroz no micro-ondas por 2 minutos", "Sirva em um prato", "Adicione sobras da geladeira e sirva"],
    },
  ],
  th: [
    {
      title: "ข้าวราดไข่ดิบ", type: "時短", cookTime: "2 นาที", difficulty: "簡単",
      ingredients: ["ไข่ 1 ฟอง", "ข้าว 1 ถ้วย", "ซอสถั่วเหลืองตามชอบ"],
      missingIngredients: [], substitutions: [],
      steps: ["ตักข้าวใส่ถ้วย", "แตกไข่ดิบลงบนข้าว", "ราดซอสถั่วเหลืองแล้วรับประทาน"],
    },
    {
      title: "แค่ทอด! ไข่ดาวง่ายๆ", type: "時短", cookTime: "5 นาที", difficulty: "簡単",
      ingredients: ["ไข่ 2 ฟอง", "เกลือตามชอบ", "น้ำมันพืชนิดหน่อย"],
      missingIngredients: [], substitutions: [],
      steps: ["ใส่น้ำมันในกระทะแล้วเปิดไฟกลาง", "ค่อยๆ แตกไข่ลงในกระทะ", "ปิดฝาแล้วนึ่ง 2 นาที"],
    },
    {
      title: "แค่อุ่น! ข้าวกล่องพร้อมทาน", type: "節約", cookTime: "3 นาที", difficulty: "簡単",
      ingredients: ["ข้าวกล่องสำเร็จรูป 1 กล่อง", "อาหารเหลือในตู้เย็น"],
      missingIngredients: [], substitutions: [],
      steps: ["อุ่นข้าวกล่องในไมโครเวฟ 2 นาที", "ตักใส่จาน", "เพิ่มอาหารเหลือจากตู้เย็นแล้วรับประทาน"],
    },
  ],
  "zh-TW": [
    {
      title: "雞蛋拌飯", type: "時短", cookTime: "2分鐘", difficulty: "簡単",
      ingredients: ["雞蛋 1個", "白飯 1碗", "醬油 少許"],
      missingIngredients: [], substitutions: [],
      steps: ["將白飯盛入碗中", "打入生雞蛋", "淋上醬油即可享用"],
    },
    {
      title: "只需煎！簡單煎蛋", type: "時短", cookTime: "5分鐘", difficulty: "簡単",
      ingredients: ["雞蛋 2個", "鹽 少許", "食用油 少許"],
      missingIngredients: [], substitutions: [],
      steps: ["平底鍋倒油，中火加熱", "輕輕打入雞蛋", "蓋上鍋蓋燜2分鐘即成"],
    },
    {
      title: "加熱即可！便當套餐", type: "節約", cookTime: "3分鐘", difficulty: "簡単",
      ingredients: ["微波米飯 1包", "冰箱裡的剩菜適量"],
      missingIngredients: [], substitutions: [],
      steps: ["將米飯放入微波爐加熱2分鐘", "盛入盤中", "搭配冰箱中的小菜即可"],
    },
  ],
};

/**
 * API失敗時のフォールバックレシピを現在言語で返す。
 * page.tsx の generateRecipes try/catch の catch ブロックで使用する。
 *
 * @example
 *   getFallbackRecipes("en")  // → [{ title: "Rice with Raw Egg (TKG)", ... }, ...]
 *   getFallbackRecipes("ja")  // → [{ title: "卵かけご飯", ... }, ...]
 */
export function getFallbackRecipes(lang: Lang): Recipe[] {
  return FALLBACK_DATA[lang] ?? FALLBACK_DATA["ja"];
}

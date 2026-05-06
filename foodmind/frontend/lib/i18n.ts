export type Lang =
  | "ja" | "en" | "vi" | "my" | "ne"
  | "id" | "zh" | "ko" | "pt" | "th" | "zh-TW";

export const LANG_META: Record<Lang, { flag: string; label: string }> = {
  ja:      { flag: "🇯🇵", label: "日本語" },
  en:      { flag: "🇺🇸", label: "English" },
  vi:      { flag: "🇻🇳", label: "Tiếng Việt" },
  my:      { flag: "🇲🇲", label: "မြန်မာ" },
  ne:      { flag: "🇳🇵", label: "नेपाली" },
  id:      { flag: "🇮🇩", label: "Indonesia" },
  zh:      { flag: "🇨🇳", label: "中文" },
  ko:      { flag: "🇰🇷", label: "한국어" },
  pt:      { flag: "🇧🇷", label: "Português" },
  th:      { flag: "🇹🇭", label: "ภาษาไทย" },
  "zh-TW": { flag: "🇹🇼", label: "繁體中文" },
};

export interface T {
  navHome: string;
  navInventory: string;
  navAdd: string;
  navShopping: string;
  navLang: string;
  navShare: string;
  catFridge: string;
  catFreezer: string;
  catVegetable: string;
  catPantry: string;
  homeSubtitle: string;
  homeTagline: string;
  homeUrgent: (names: string) => string;
  homeWarning: (names: string) => string;
  homePriorityTitle: string;
  homeItemCount: (n: number) => string;
  homeEmptyTitle: string;
  homeEmptyHint: string;
  homeTodayTitle: string;
  homeGenerate: string;
  homeGenerating: string;
  homeRegenerate: string;
  homeGenerateDesc: string;
  homeErrFetch: string;
  homeErrRecipe: string;
  homeUrgentLabel: string;
  homeUrgentTap: string;
  homeFridgeScore: string;
  homeSavingsDesc: (n: number) => string;
  homeStatusGood: string;
  homeStatusWarn: string;
  homeStatusUrgent: string;
  homeServings: (n: number) => string;
  homeServingNote: string;
  homeMissingSend: string;
  homeMissingSent: string;
  invSubtitle: string;
  invTitle: string;
  invNItems: (n: number) => string;
  invUrgent: (n: number) => string;
  invTabAll: string;
  invEmpty: string;
  invToday: string;
  invDaysLeft: (n: number) => string;
  invConsume: string;
  invEdit: string;
  invSave: string;
  invDelete: string;
  invDeleteConfirm: string;
  addSubtitle: string;
  addTitle: string;
  addModeList: string;
  addModeManual: string;
  addModeCamera: string;
  addSearch: string;
  addSelectedBadge: string;
  addNotFound: (q: string) => string;
  addNameLabel: string;
  addNamePlaceholder: string;
  addStorageLabel: string;
  addQtyLabel: string;
  addExpiryLabel: string;
  addSubmitting: string;
  addSave: string;
  addErrName: string;
  addErrFailed: string;
  addCamTitle: string;
  addCamDesc1: string;
  addCamDesc2: string;
  addCamOpen: string;
  addCamAnalyzing: string;
  addCamErrId: string;
  addCamErrSave: string;
  addTipsTitle: string;
  addTip1: string;
  addTip2: string;
  addTip3: string;
  addBarSelected: (n: number) => string;
  addBarClear: string;
  addBarAdd: string;
  addModalListTitle: (n: number) => string;
  addModalVisionTitle: string;
  addModalSubtitle: string;
  addModalCancel: string;
  addModalSave: (n: number) => string;
  addDayUnit: string;
  addPieceUnit: string;
  recipeOpen: string;
  recipeClose: string;
  recipeMissing: string;
  demoTitle: string;
  demoDesc: string;
  demoBtn: string;
  demoLoading: string;
  shopTitle: string;
  shopSubtitle: string;
  shopDesc: string;
  shopNeed: string;
  shopSoon: string;
  shopExtra: string;
  shopEmpty: string;
  shopBought: string;
  shopClear: string;
  grpLabels: Record<string, string>;
  locale: string;
  lang: string;
  nameSep: string;
  shopItemCount: (n: number) => string;
  shopMemoTitle: string;
  shopVoiceListen: string;
  shopMemoPlaceholder: string;
  shopVoiceListening: string;
  shopVoiceInterim: (text: string) => string;
  shopVoiceErr: string;
  shopVoiceHint: string;
  shopFullStock: string;
  shopVoiceErrHttps: string;
  shopVoiceErrBrowser: string;
  shopVoiceErrMic: string;
  shopVoiceErrNoSpeech: string;
  shopVoiceErrNetwork: string;
  shopVoiceErrAudio: string;
  shopClearCount: (n: number) => string;
  allergyBtn: string;
  allergyTitle: string;
  allergyDesc: string;
  allergyMandatory: string;
  allergyRecommended: string;
  allergySave: string;
  allergySaveCount: (n: number) => string;
  allergenNames: Record<string, string>;
}

// ── 日本語 ──────────────────────────────────────────────
const ja: T = {
  navHome: "ホーム", navInventory: "食材", navAdd: "追加", navShopping: "買い物", navLang: "言語", navShare: "シェア",
  catFridge: "冷蔵", catFreezer: "冷凍", catVegetable: "野菜室", catPantry: "常温",
  homeSubtitle: "食材在庫 AI",
  homeTagline: "冷蔵庫を、おいしく使いきろう",
  homeUrgent: (names) => `${names}を今すぐ使ってください`,
  homeWarning: (names) => `もうすぐ期限の${names}があります`,
  homePriorityTitle: "早めに使いたい食材",
  homeItemCount: (n) => `${n}件`,
  homeEmptyTitle: "まだ食材がありません",
  homeEmptyHint: "食材を入れて、献立を考えよう",
  homeTodayTitle: "今日つくれるもの",
  homeGenerate: "🍽️ できる献立を考えてもらう",
  homeGenerating: "AIが献立を考えています…",
  homeRegenerate: "↻ もう一度考えてもらう",
  homeGenerateDesc: "登録した食材と冷蔵・冷凍・野菜室の写真から、今すぐ作れる献立をAIが提案します。",
  homeErrFetch: "データ取得に失敗しました",
  homeErrRecipe: "レシピ生成に失敗しました",
  homeUrgentLabel: "たすけて〜！", homeUrgentTap: "タップで今すぐレシピを考えてもらう →",
  homeFridgeScore: "🥬 冷蔵庫スコア", homeSavingsDesc: (n) => `今日は${n}つの食材をムダにせず使えそう`,
  homeStatusGood: "問題なし", homeStatusWarn: "一部注意", homeStatusUrgent: "要確認",
  homeServings: (n) => `人数：${n}人前`, homeServingNote: "材料のみ人数分に調整", homeMissingSend: "不足食材を買い物リストへ", homeMissingSent: "追加しました ✓",
  invSubtitle: "My Food", invTitle: "うちの食材",
  invNItems: (n) => `${n}件の食材`,
  invUrgent: (n) => `期限注意 ${n}件`,
  invTabAll: "全て", invEmpty: "食材がありません",
  invToday: "今日まで！", invDaysLeft: (n) => `あと${n}日`,
  invConsume: "消費", invEdit: "変更", invSave: "保存する", invDelete: "削除", invDeleteConfirm: "削除しますか？",
  addSubtitle: "Add Food", addTitle: "食材を入れる",
  addModeList: "🗂 一覧から選ぶ", addModeManual: "✏️ 名前で入れる", addModeCamera: "📸 写真で登録",
  addSearch: "食材を探す", addSelectedBadge: "✓ 選択済",
  addNotFound: (q) => `「${q}」は見つかりません`,
  addNameLabel: "食材名 *", addNamePlaceholder: "例：キャベツ",
  addStorageLabel: "保存場所", addQtyLabel: "数量", addExpiryLabel: "期限（日後）",
  addSubmitting: "追加中...", addSave: "追加する",
  addErrName: "食材名を入力してください", addErrFailed: "追加に失敗しました",
  addCamTitle: "冷蔵庫・冷凍庫を撮影",
  addCamDesc1: "AIが食材を自動識別します",
  addCamDesc2: "複数の食材を一度に登録できます",
  addCamOpen: "カメラ / ファイルを開く", addCamAnalyzing: "AIが識別中…",
  addCamErrId: "識別に失敗しました", addCamErrSave: "保存に失敗しました",
  addTipsTitle: "📋 撮影のコツ",
  addTip1: "庫内全体が写るように撮影",
  addTip2: "明るい場所で撮影するとより正確",
  addTip3: "識別結果は編集して修正できます",
  addBarSelected: (n) => `${n}件を選択中`,
  addBarClear: "クリア", addBarAdd: "追加する →",
  addModalListTitle: (n) => `${n}件の食材を追加`,
  addModalVisionTitle: "AIが識別した食材",
  addModalSubtitle: "カテゴリと期限を確認してください",
  addModalCancel: "キャンセル", addModalSave: (n) => `${n}件を保存`,
  addDayUnit: "日", addPieceUnit: "個",
  recipeOpen: "▼ 作り方を見る", recipeClose: "▲ 手順を閉じる", recipeMissing: "要追加:",
  demoTitle: "まず試してみよう", demoDesc: "食材サンプルを入れてAIに献立を聞いてみよう", demoBtn: "▶ お試しで使ってみる", demoLoading: "デモデータを準備中…",
  shopTitle: "買い物リスト", shopSubtitle: "Shopping", shopDesc: "冷蔵庫から自動で作成",
  shopNeed: "今すぐ必要", shopSoon: "そろそろ", shopExtra: "ついで買い",
  shopEmpty: "買うものはありません", shopBought: "買った", shopClear: "完了を消す",
  grpLabels: { "すべて":"すべて","野菜":"野菜・果物","きのこ":"きのこ","芋類":"芋類","魚介":"お魚","肉類":"お肉","卵・乳":"乳製品・卵","主食":"主食","調味料":"調味料","スパイス":"スパイス","食用油":"食用油","缶詰":"缶詰・瓶詰め","レトルト":"レトルト","冷凍品":"冷凍食品","飲み物":"飲み物" },
  locale: "ja-JP", lang: "ja", nameSep: "・",
  shopItemCount: (n) => `${n}品`, shopMemoTitle: "買い物メモ", shopVoiceListen: "話しかけてください…", shopMemoPlaceholder: "メモを入力… (例: しょうゆ 濃口)", shopVoiceListening: "聞いています…", shopVoiceInterim: (t) => `「${t}」`, shopVoiceErr: "音声入力が使えません", shopVoiceHint: "🎙️ マイクまたは入力、上のカテゴリ選択でリスト追加", shopFullStock: "食材が十分あります",
  shopVoiceErrHttps: "音声入力はHTTPS環境が必要です。Vercelの本番URLでお試しください。", shopVoiceErrBrowser: "このブラウザは音声入力非対応です（Chrome / Safari をお試しください）", shopVoiceErrMic: "マイクが許可されていません。ブラウザの🔒からマイクを許可してください。", shopVoiceErrNoSpeech: "声が検出されませんでした。もう少し大きな声でお試しください。", shopVoiceErrNetwork: "音声入力はHTTPS本番環境でのみ動作します。\nテキスト入力をご利用ください。", shopVoiceErrAudio: "マイクが見つかりません。端末のマイクを確認してください。", shopClearCount: (n) => `（${n}件）`,
  allergyBtn: "⚠️ アレルギー設定", allergyTitle: "食べられないものを選ぼう", allergyDesc: "入っていたら食べられないものをタップしてください", allergyMandatory: "特定原材料（必須 10品目）", allergyRecommended: "気になる食材（任意 18品目）", allergySave: "保存する", allergySaveCount: (n) => `（${n}品目を除外）`,
  allergenNames: { shrimp:"えび", crab:"かに", walnut:"くるみ", wheat:"小麦", buckwheat:"そば", egg:"卵", dairy:"乳", peanut:"落花生", macadamia:"マカダミアナッツ", cashew:"カシューナッツ", almond:"アーモンド", abalone:"あわび", squid:"いか", salmon_roe:"いくら", orange:"オレンジ", kiwi:"キウイフルーツ", beef:"牛肉", sesame:"ごま", salmon:"さけ", mackerel:"さば", soy:"大豆", chicken:"鶏肉", banana:"バナナ", pork:"豚肉", peach:"もも", yam:"やまいも", apple:"りんご", gelatin:"ゼラチン" },
};

// ── English ─────────────────────────────────────────────
const en: T = {
  navHome: "Home", navInventory: "Pantry", navAdd: "Add", navShopping: "Shop", navLang: "Lang", navShare: "Share",
  catFridge: "Fridge", catFreezer: "Freezer", catVegetable: "Veggie", catPantry: "Pantry",
  homeSubtitle: "AI Food Assistant",
  homeTagline: "Quick meals from leftover ingredients",
  homeUrgent: (names) => `Use ${names} now!`,
  homeWarning: (names) => `${names} — expiring soon`,
  homePriorityTitle: "Use First",
  homeItemCount: (n) => `${n} items`,
  homeEmptyTitle: "No ingredients yet",
  homeEmptyHint: "Tap \"Add\" to register food",
  homeTodayTitle: "Today's Recipes",
  homeGenerate: "🍽️ Suggest a Meal",
  homeGenerating: "AI is thinking…",
  homeRegenerate: "↻ Try Again",
  homeGenerateDesc: "AI suggests meals using your registered ingredients and fridge photos.",
  homeErrFetch: "Failed to load data",
  homeErrRecipe: "Failed to generate recipes",
  homeUrgentLabel: "Help me!", homeUrgentTap: "Tap for recipe ideas →",
  homeFridgeScore: "🥬 Fridge Score", homeSavingsDesc: (n) => `${n} items you can use today`,
  homeStatusGood: "All Good", homeStatusWarn: "Check Soon", homeStatusUrgent: "Needs Attention",
  homeServings: (n) => `Servings: ${n}`, homeServingNote: "Ingredients scale with servings", homeMissingSend: "Send missing to shopping list", homeMissingSent: "Added ✓",
  invSubtitle: "Inventory", invTitle: "My Pantry",
  invNItems: (n) => `${n} items`,
  invUrgent: (n) => `${n} expiring!`,
  invTabAll: "All", invEmpty: "No items",
  invToday: "Today!", invDaysLeft: (n) => `${n}d left`,
  invConsume: "Use", invEdit: "Edit", invSave: "Save", invDelete: "Delete", invDeleteConfirm: "Delete this item?",
  addSubtitle: "Add Food", addTitle: "Add Ingredient",
  addModeList: "🗂 From List", addModeManual: "✏️ Manual", addModeCamera: "📸 Camera",
  addSearch: "Search ingredients...", addSelectedBadge: "✓ Selected",
  addNotFound: (q) => `"${q}" not found`,
  addNameLabel: "Ingredient *", addNamePlaceholder: "e.g. Cabbage",
  addStorageLabel: "Storage", addQtyLabel: "Qty", addExpiryLabel: "Expires in (days)",
  addSubmitting: "Adding...", addSave: "Add",
  addErrName: "Please enter a name", addErrFailed: "Failed to add",
  addCamTitle: "Photo of Fridge/Freezer",
  addCamDesc1: "AI will identify ingredients automatically",
  addCamDesc2: "Register multiple items at once",
  addCamOpen: "Open Camera / File", addCamAnalyzing: "AI identifying…",
  addCamErrId: "Failed to identify", addCamErrSave: "Failed to save",
  addTipsTitle: "📋 Tips",
  addTip1: "Capture the whole fridge interior",
  addTip2: "Good lighting improves accuracy",
  addTip3: "You can edit results before saving",
  addBarSelected: (n) => `${n} selected`,
  addBarClear: "Clear", addBarAdd: "Add →",
  addModalListTitle: (n) => `Add ${n} items`,
  addModalVisionTitle: "AI Identified Items",
  addModalSubtitle: "Check category and expiry date",
  addModalCancel: "Cancel", addModalSave: (n) => `Save ${n}`,
  addDayUnit: "d", addPieceUnit: "pc",
  recipeOpen: "▼ Show Steps", recipeClose: "▲ Hide Steps", recipeMissing: "Need:",
  demoTitle: "Try the Demo", demoDesc: "Add sample ingredients and auto-generate AI recipes", demoBtn: "🎮 Start Demo", demoLoading: "Preparing demo…",
  shopTitle: "Shopping List", shopSubtitle: "Shopping", shopDesc: "Auto-generated from your pantry",
  shopNeed: "Need Now", shopSoon: "Getting Low", shopExtra: "While You're There",
  shopEmpty: "Nothing to buy", shopBought: "Got it", shopClear: "Clear done",
  grpLabels: { "すべて":"All","野菜":"Veggie","きのこ":"Mushroom","芋類":"Tuber","魚介":"Seafood","肉類":"Meat","卵・乳":"Egg/Dairy","主食":"Staple","調味料":"Seasoning","スパイス":"Spice","食用油":"Oil","缶詰":"Canned","レトルト":"Ready Meal","冷凍品":"Frozen","飲み物":"Drinks" },
  locale: "en-US", lang: "en", nameSep: " · ",
  shopItemCount: (n) => `${n} items`, shopMemoTitle: "Shopping Notes", shopVoiceListen: "Speak now…", shopMemoPlaceholder: "Add item… (e.g. soy sauce)", shopVoiceListening: "Listening…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "Voice input unavailable", shopVoiceHint: "🎙️ Use mic, type, or tap a category", shopFullStock: "Your pantry is well stocked",
  shopVoiceErrHttps: "Voice input requires HTTPS. Try the production URL.", shopVoiceErrBrowser: "Browser doesn't support voice (try Chrome/Safari)", shopVoiceErrMic: "Microphone not allowed. Enable it in browser settings.", shopVoiceErrNoSpeech: "No speech detected. Please speak louder.", shopVoiceErrNetwork: "Voice input works only on HTTPS. Use text instead.", shopVoiceErrAudio: "Microphone not found. Check your device.", shopClearCount: (n) => ` (${n})`,
  allergyBtn: "⚠️ Allergy Settings", allergyTitle: "Select foods to avoid", allergyDesc: "Tap items you cannot eat", allergyMandatory: "Required Allergens (10 items)", allergyRecommended: "Optional Allergens (18 items)", allergySave: "Save", allergySaveCount: (n) => ` (${n} excluded)`,
  allergenNames: { shrimp:"Shrimp", crab:"Crab", walnut:"Walnut", wheat:"Wheat", buckwheat:"Buckwheat", egg:"Egg", dairy:"Dairy", peanut:"Peanut", macadamia:"Macadamia", cashew:"Cashew", almond:"Almond", abalone:"Abalone", squid:"Squid", salmon_roe:"Salmon Roe", orange:"Orange", kiwi:"Kiwi", beef:"Beef", sesame:"Sesame", salmon:"Salmon", mackerel:"Mackerel", soy:"Soy", chicken:"Chicken", banana:"Banana", pork:"Pork", peach:"Peach", yam:"Yam", apple:"Apple", gelatin:"Gelatin" },
};

// ── Tiếng Việt ──────────────────────────────────────────
const vi: T = {
  navHome: "Trang chủ", navInventory: "Kho", navAdd: "Thêm", navShopping: "Mua sắm", navLang: "Ngôn ngữ", navShare: "Chia sẻ",
  catFridge: "Tủ lạnh", catFreezer: "Ngăn đông", catVegetable: "Rau củ", catPantry: "Để khô",
  homeSubtitle: "Trợ lý AI",
  homeTagline: "Nấu nhanh từ nguyên liệu còn lại",
  homeUrgent: (names) => `${names} — dùng ngay!`,
  homeWarning: (names) => `${names} sắp hết hạn`,
  homePriorityTitle: "Dùng trước",
  homeItemCount: (n) => `${n} món`,
  homeEmptyTitle: "Chưa có thực phẩm",
  homeEmptyHint: "Nhấn \"Thêm\" để đăng ký",
  homeTodayTitle: "Gợi ý hôm nay",
  homeGenerate: "🍽️ Gợi ý bữa ăn",
  homeGenerating: "AI đang xử lý…",
  homeRegenerate: "↻ Tạo lại",
  homeGenerateDesc: "Gợi ý bữa ăn có thể nấu ngay",
  homeErrFetch: "Không tải được dữ liệu",
  homeErrRecipe: "Không tạo được công thức",
  homeUrgentLabel: "Cứu với!", homeUrgentTap: "Nhấn để xem công thức →",
  homeFridgeScore: "🥬 Điểm Tủ Lạnh", homeSavingsDesc: (n) => `${n} món có thể dùng hôm nay`,
  homeStatusGood: "Tốt", homeStatusWarn: "Chú ý", homeStatusUrgent: "Cần xem",
  homeServings: (n) => `Khẩu phần: ${n}`, homeServingNote: "Nguyên liệu tự điều chỉnh theo số người", homeMissingSend: "Gửi thiếu vào danh sách mua", homeMissingSent: "Đã thêm ✓",
  invSubtitle: "Kho thực phẩm", invTitle: "Quản lý kho",
  invNItems: (n) => `${n} thực phẩm`,
  invUrgent: (n) => `${n} món sắp hết!`,
  invTabAll: "Tất cả", invEmpty: "Không có thực phẩm",
  invToday: "Hôm nay!", invDaysLeft: (n) => `còn ${n} ngày`,
  invConsume: "Dùng", invEdit: "Sửa", invSave: "Lưu", invDelete: "Xóa", invDeleteConfirm: "Xóa món này?",
  addSubtitle: "Thêm thực phẩm", addTitle: "Thêm nguyên liệu",
  addModeList: "🗂 Từ danh sách", addModeManual: "✏️ Nhập tay", addModeCamera: "📸 Chụp ảnh",
  addSearch: "Tìm kiếm...", addSelectedBadge: "✓ Đã chọn",
  addNotFound: (q) => `Không tìm thấy "${q}"`,
  addNameLabel: "Tên nguyên liệu *", addNamePlaceholder: "VD: Bắp cải",
  addStorageLabel: "Nơi lưu trữ", addQtyLabel: "Số lượng", addExpiryLabel: "Hết hạn (ngày)",
  addSubmitting: "Đang thêm...", addSave: "Thêm",
  addErrName: "Nhập tên nguyên liệu", addErrFailed: "Thêm thất bại",
  addCamTitle: "Chụp ảnh tủ lạnh",
  addCamDesc1: "AI tự động nhận dạng thực phẩm",
  addCamDesc2: "Đăng ký nhiều món cùng lúc",
  addCamOpen: "Mở Camera / Tệp", addCamAnalyzing: "AI đang nhận dạng…",
  addCamErrId: "Nhận dạng thất bại", addCamErrSave: "Lưu thất bại",
  addTipsTitle: "📋 Mẹo chụp ảnh",
  addTip1: "Chụp toàn bộ bên trong tủ lạnh",
  addTip2: "Ánh sáng tốt cho kết quả chính xác hơn",
  addTip3: "Có thể chỉnh sửa kết quả trước khi lưu",
  addBarSelected: (n) => `Đã chọn ${n} món`,
  addBarClear: "Xóa", addBarAdd: "Thêm →",
  addModalListTitle: (n) => `Thêm ${n} nguyên liệu`,
  addModalVisionTitle: "AI đã nhận dạng",
  addModalSubtitle: "Kiểm tra loại và hạn sử dụng",
  addModalCancel: "Hủy", addModalSave: (n) => `Lưu ${n} món`,
  addDayUnit: "ngày", addPieceUnit: "cái",
  recipeOpen: "▼ Xem cách làm", recipeClose: "▲ Ẩn cách làm", recipeMissing: "Cần thêm:",
  demoTitle: "Thử demo", demoDesc: "Thêm nguyên liệu mẫu và tạo công thức AI tự động", demoBtn: "🎮 Bắt đầu demo", demoLoading: "Đang chuẩn bị…",
  shopTitle: "Danh sách mua", shopSubtitle: "Shopping", shopDesc: "Tự tạo từ tủ lạnh",
  shopNeed: "Cần ngay", shopSoon: "Sắp cần", shopExtra: "Tiện mua",
  shopEmpty: "Không có gì cần mua", shopBought: "Đã mua", shopClear: "Xóa đã mua",
  grpLabels: { "すべて":"Tất cả","野菜":"Rau củ","きのこ":"Nấm","芋類":"Khoai","魚介":"Hải sản","肉類":"Thịt","卵・乳":"Trứng/Sữa","主食":"Tinh bột","調味料":"Gia vị","スパイス":"Spice","食用油":"Dầu ăn","缶詰":"Đồ hộp","レトルト":"Đóng gói","冷凍品":"Đông lạnh","飲み物":"Đồ uống" },
  locale: "vi-VN", lang: "vi", nameSep: " · ",
  shopItemCount: (n) => `${n} món`, shopMemoTitle: "Ghi chú mua sắm", shopVoiceListen: "Hãy nói…", shopMemoPlaceholder: "Thêm món… (VD: nước tương)", shopVoiceListening: "Đang nghe…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "Không thể dùng giọng nói", shopVoiceHint: "🎙️ Dùng mic, gõ hoặc chọn danh mục", shopFullStock: "Tủ lạnh của bạn đã đầy đủ",
  shopVoiceErrHttps: "Nhập giọng cần HTTPS. Thử URL Vercel.", shopVoiceErrBrowser: "Trình duyệt không hỗ trợ (thử Chrome/Safari)", shopVoiceErrMic: "Microphone chưa được cho phép.", shopVoiceErrNoSpeech: "Không nghe thấy giọng. Hãy nói to hơn.", shopVoiceErrNetwork: "Chỉ hoạt động trên HTTPS. Dùng bàn phím.", shopVoiceErrAudio: "Không tìm thấy microphone.", shopClearCount: (n) => ` (${n})`,
  allergyBtn: "⚠️ Cài đặt dị ứng", allergyTitle: "Chọn thực phẩm cần tránh", allergyDesc: "Chọn những thứ bạn không thể ăn", allergyMandatory: "Dị ứng bắt buộc (10 loại)", allergyRecommended: "Dị ứng tùy chọn (18 loại)", allergySave: "Lưu", allergySaveCount: (n) => ` (loại trừ ${n})`,
  allergenNames: { shrimp:"Tôm", crab:"Cua", walnut:"Óc chó", wheat:"Lúa mì", buckwheat:"Kiều mạch", egg:"Trứng", dairy:"Sữa", peanut:"Đậu phộng", macadamia:"Macadamia", cashew:"Hạt điều", almond:"Hạnh nhân", abalone:"Bào ngư", squid:"Mực", salmon_roe:"Trứng cá hồi", orange:"Cam", kiwi:"Kiwi", beef:"Thịt bò", sesame:"Mè", salmon:"Cá hồi", mackerel:"Cá thu", soy:"Đậu nành", chicken:"Thịt gà", banana:"Chuối", pork:"Thịt heo", peach:"Đào", yam:"Khoai", apple:"Táo", gelatin:"Gelatin" },
};

// ── မြန်မာ ──────────────────────────────────────────────
const my: T = {
  navHome: "ပင်မ", navInventory: "ကုန်ပစ္စည်း", navAdd: "ထည့်ရန်", navShopping: "ဝယ်ပါ", navLang: "ဘာသာ", navShare: "Share",
  catFridge: "ရေခဲသေတ္တာ", catFreezer: "အေးခဲ", catVegetable: "ဟင်းသီး", catPantry: "ပုံမှန်",
  homeSubtitle: "AI အစားအသောက်",
  homeTagline: "ကျန်ပစ္စည်းဖြင့် လွယ်ကူသောထမင်း",
  homeUrgent: (names) => `${names} — အခုပဲသုံးပါ!`,
  homeWarning: (names) => `${names} — သက်တမ်းနီးနေပြီ`,
  homePriorityTitle: "အရင်ဆုံးသုံးမည်",
  homeItemCount: (n) => `${n} ခု`,
  homeEmptyTitle: "ပစ္စည်းမရှိသေးပါ",
  homeEmptyHint: "\"ထည့်ရန်\" ကိုနှိပ်ပါ",
  homeTodayTitle: "ယနေ့ အကြံပြုချက်",
  homeGenerate: "🍽️ ချက်နည်းအကြံပြုပါ",
  homeGenerating: "AI စဉ်းစားနေသည်…",
  homeRegenerate: "↻ ပြန်ထုတ်ပါ",
  homeGenerateDesc: "သင့်ပစ္စည်းများဖြင့် ယခုချက်ပြုတ်နိုင်သောစာရင်း",
  homeErrFetch: "ဒေတာတင်မရပါ",
  homeErrRecipe: "ချက်နည်းထုတ်မရပါ",
  homeUrgentLabel: "ကူညီပါ!", homeUrgentTap: "ချက်နည်းကြည့်ရန် →",
  homeFridgeScore: "🥬 ရေခဲဘူး Score", homeSavingsDesc: (n) => `ယနေ့ ${n} ခုသုံးနိုင်`,
  homeStatusGood: "အဆင်ပြေ", homeStatusWarn: "သတိပြု", homeStatusUrgent: "အရေးပေါ်",
  homeServings: (n) => `လူဦးရေ: ${n}`, homeServingNote: "ပမာဏသာ ချိန်ညှိသည်", homeMissingSend: "လိုအပ်သောပစ္စည်း ဝယ်စာရင်းထဲ", homeMissingSent: "ထည့်ပြီး ✓",
  invSubtitle: "Inventory", invTitle: "သိုလှောင်ပစ္စည်း",
  invNItems: (n) => `${n} မျိုး`,
  invUrgent: (n) => `${n} ခု သတိပြုပါ!`,
  invTabAll: "အားလုံး", invEmpty: "ပစ္စည်းမရှိပါ",
  invToday: "ယနေ့ကုန်မည်!", invDaysLeft: (n) => `${n} ရက်ကျန်`,
  invConsume: "သုံးပါ", invEdit: "ပြင်ပါ", invSave: "သိမ်းပါ", invDelete: "ဖျက်ပါ", invDeleteConfirm: "ဖျက်ပါမလား?",
  addSubtitle: "ပစ္စည်းထည့်ပါ", addTitle: "ပစ္စည်းထည့်ပါ",
  addModeList: "🗂 စာရင်းမှ", addModeManual: "✏️ ကိုယ်တိုင်", addModeCamera: "📸 ဓာတ်ပုံ",
  addSearch: "ရှာဖွေပါ...", addSelectedBadge: "✓ ရွေးပြီး",
  addNotFound: (q) => `"${q}" မတွေ့ပါ`,
  addNameLabel: "အမည် *", addNamePlaceholder: "ဥပမာ: ဂေါ်ဖီ",
  addStorageLabel: "သိမ်းဆည်းရာ", addQtyLabel: "အရေအတွက်", addExpiryLabel: "သက်တမ်း (ရက်)",
  addSubmitting: "ထည့်နေသည်...", addSave: "ထည့်ပါ",
  addErrName: "အမည်ထည့်ပါ", addErrFailed: "ထည့်မရပါ",
  addCamTitle: "ရေခဲသေတ္တာဓာတ်ပုံရိုက်ပါ",
  addCamDesc1: "AI မှ အလိုအလျောက်သိမြင်မည်",
  addCamDesc2: "တစ်ကြိမ်တည်းတွင် များစွာမှတ်ပုံတင်နိုင်",
  addCamOpen: "ကင်မရာ / ဖိုင် ဖွင့်ပါ", addCamAnalyzing: "AI သိမြင်နေသည်…",
  addCamErrId: "သိမြင်မရပါ", addCamErrSave: "သိမ်းမရပါ",
  addTipsTitle: "📋 အကြံပြုချက်",
  addTip1: "ရေခဲသေတ္တာတွင်း ကောင်းကောင်းမြင်ရအောင်ရိုက်ပါ",
  addTip2: "အလင်းပါသောနေရာတွင် ပိုတိကျသည်",
  addTip3: "ရလဒ်ကို ပြင်ဆင်နိုင်သည်",
  addBarSelected: (n) => `${n} ခုရွေးပြီး`,
  addBarClear: "ဖျက်ပါ", addBarAdd: "ထည့်ပါ →",
  addModalListTitle: (n) => `${n} ခုထည့်မည်`,
  addModalVisionTitle: "AI သိမြင်သောပစ္စည်းများ",
  addModalSubtitle: "အမျိုးအစားနှင့် သက်တမ်းစစ်ဆေးပါ",
  addModalCancel: "မလုပ်တော့ပါ", addModalSave: (n) => `${n} ခုသိမ်းပါ`,
  addDayUnit: "ရက်", addPieceUnit: "ခု",
  recipeOpen: "▼ နည်းကြည့်ပါ", recipeClose: "▲ ပိတ်ပါ", recipeMissing: "လိုအပ်သည်:",
  demoTitle: "Demo ကြည့်ပါ", demoDesc: "နမူနာပစ္စည်းများထည့်ပြီး AI ချက်နည်းထုတ်ပါ", demoBtn: "🎮 Demo စတင်ပါ", demoLoading: "ပြင်ဆင်နေသည်…",
  shopTitle: "ဝယ်ရမည့်စာရင်း", shopSubtitle: "Shopping", shopDesc: "ရေခဲသေတ္တာမှ အလိုအလျောက်",
  shopNeed: "ယခုလိုအပ်", shopSoon: "မကြာမီ", shopExtra: "တစ်ပါတည်း",
  shopEmpty: "ဝယ်စရာမရှိပါ", shopBought: "ဝယ်ပြီး", shopClear: "ရှင်းပါ",
  grpLabels: { "すべて":"အားလုံး","野菜":"ဟင်းသီး","きのこ":"မှိုများ","芋類":"အာလူး","魚介":"ငါးပိုး","肉類":"အသား","卵・乳":"ဥ/နို့","主食":"အဓိကစာ","調味料":"အမွှေးအကြိုင်","スパイス":"ဆေးဖက်","食用油":"ဆီ","缶詰":"ဗူးသွပ်","レトルト":"ထုပ်ပိုး","冷凍品":"အေးခဲ","飲み物":"သောက်စရာ" },
  locale: "my-MM", lang: "my", nameSep: "、",
  shopItemCount: (n) => `${n} ခု`, shopMemoTitle: "မှတ်စုများ", shopVoiceListen: "ပြောပါ…", shopMemoPlaceholder: "ထည့်ပါ…", shopVoiceListening: "နားထောင်နေ…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "အသံထည့်မရပါ", shopVoiceHint: "🎙️ မိုက်ဖုန်း၊ ရိုက်၊ ဒါမှမဟုတ် အမျိုးအစားရွေး", shopFullStock: "ပစ္စည်းလုံလောက်ပါသည်",
  shopVoiceErrHttps: "HTTPS လိုအပ်သည်", shopVoiceErrBrowser: "Browser မတည့်ပါ (Chrome/Safari သုံးပါ)", shopVoiceErrMic: "မိုက်ဖုန်းခွင့်မပြုပါ", shopVoiceErrNoSpeech: "အသံမကြားပါ", shopVoiceErrNetwork: "HTTPS သာ လုပ်ဆောင်သည်", shopVoiceErrAudio: "မိုက်ဖုန်းမတွေ့ပါ", shopClearCount: (n) => ` (${n})`,
  allergyBtn: "⚠️ အာဟာရမတည့်မှု", allergyTitle: "မစားနိုင်သောအစားအစာ ရွေးပါ", allergyDesc: "မစားနိုင်သောပစ္စည်းကိုနှိပ်ပါ", allergyMandatory: "မဖြစ်မနေ (၁၀ မျိုး)", allergyRecommended: "ဆန္ဒမူ (၁၈ မျိုး)", allergySave: "သိမ်းပါ", allergySaveCount: (n) => ` (${n} မျိုးဖယ်)`,
  allergenNames: { shrimp:"ပုဇွန်", crab:"ဘဲကောင်", walnut:"ဝါနပ်", wheat:"ဂျုံ", buckwheat:"နုတ်ကောင်း", egg:"ဥ", dairy:"နို့", peanut:"မြေပဲ", macadamia:"မကာဒါမီးနပ်", cashew:"ကင်ဆူ", almond:"ဗာဒံ", abalone:"ပတုန်းကောင်", squid:"ငါးဥကောင်", salmon_roe:"ငါးပိုးဥ", orange:"လိမ္မော်", kiwi:"ကီဝီ", beef:"နွားသား", sesame:"နှမ်း", salmon:"ဆောမွန်", mackerel:"ကြာငါး", soy:"ပဲပိစပ်", chicken:"ကြက်", banana:"ငှက်ပျော", pork:"ဝက်သား", peach:"မောက်", yam:"ကတိုး", apple:"ပန်းသီး", gelatin:"ဂျယ်လတင်" },
};

// ── नेपाली ──────────────────────────────────────────────
const ne: T = {
  navHome: "होम", navInventory: "भण्डार", navAdd: "थप्नुस्", navShopping: "किनमेल", navLang: "भाषा", navShare: "सेयर",
  catFridge: "फ्रिज", catFreezer: "फ्रिजर", catVegetable: "तरकारी", catPantry: "सामान्य",
  homeSubtitle: "AI खाना सहायक",
  homeTagline: "बचेको सामग्रीबाट छिटो खाना",
  homeUrgent: (names) => `${names} — अहिलेनै प्रयोग गर्नुस्!`,
  homeWarning: (names) => `${names} — म्याद सकिँदैछ`,
  homePriorityTitle: "पहिले प्रयोग गर्नुस्",
  homeItemCount: (n) => `${n} वटा`,
  homeEmptyTitle: "खाना दर्ता भएको छैन",
  homeEmptyHint: "\"थप्नुस्\" मा थिच्नुस्",
  homeTodayTitle: "आजको सुझाव",
  homeGenerate: "🍽️ खाना सुझाव दिनुस्",
  homeGenerating: "AI सोच्दैछ…",
  homeRegenerate: "↻ फेरि सुझाव दिनुस्",
  homeGenerateDesc: "अहिलेनै पकाउन सकिने खाना सुझाव दिन्छ",
  homeErrFetch: "डेटा लोड भएन",
  homeErrRecipe: "रेसिपी बनाउन सकिएन",
  homeUrgentLabel: "बचाउनुस्!", homeUrgentTap: "रेसिपीको लागि थिच्नुस् →",
  homeFridgeScore: "🥬 फ्रिज स्कोर", homeSavingsDesc: (n) => `आज ${n} वटा खाना जोगाउन सकिन्छ`,
  homeStatusGood: "ठीक छ", homeStatusWarn: "ध्यान दिनुस्", homeStatusUrgent: "जरुरी",
  homeServings: (n) => `सेवा: ${n} जना`, homeServingNote: "सामग्री मात्र बढाउँछ", homeMissingSend: "नभएको सामग्री किनमेल सूचीमा", homeMissingSent: "थपियो ✓",
  invSubtitle: "Inventory", invTitle: "भण्डार व्यवस्थापन",
  invNItems: (n) => `${n} वटा खाना`,
  invUrgent: (n) => `${n} वटाको म्याद सकिँदैछ!`,
  invTabAll: "सबै", invEmpty: "खाना छैन",
  invToday: "आज!", invDaysLeft: (n) => `${n} दिन बाँकी`,
  invConsume: "प्रयोग", invEdit: "सम्पादन", invSave: "सेभ", invDelete: "मेट्नुस्", invDeleteConfirm: "मेट्ने?",
  addSubtitle: "खाना थप्नुस्", addTitle: "खाना थप्नुस्",
  addModeList: "🗂 सूचीबाट", addModeManual: "✏️ म्यानुअल", addModeCamera: "📸 फोटो",
  addSearch: "खाना खोज्नुस्...", addSelectedBadge: "✓ छानिएको",
  addNotFound: (q) => `"${q}" भेटिएन`,
  addNameLabel: "खानाको नाम *", addNamePlaceholder: "जस्तै: बन्दकोपी",
  addStorageLabel: "भण्डारण", addQtyLabel: "मात्रा", addExpiryLabel: "म्याद (दिन)",
  addSubmitting: "थप्दैछ...", addSave: "थप्नुस्",
  addErrName: "नाम लेख्नुस्", addErrFailed: "थप्न सकिएन",
  addCamTitle: "फ्रिजको फोटो खिच्नुस्",
  addCamDesc1: "AI स्वचालित रूपमा पहिचान गर्छ",
  addCamDesc2: "एकैपटक धेरै खाना दर्ता गर्न सकिन्छ",
  addCamOpen: "क्यामेरा / फाइल खोल्नुस्", addCamAnalyzing: "AI पहिचान गर्दैछ…",
  addCamErrId: "पहिचान भएन", addCamErrSave: "सेभ भएन",
  addTipsTitle: "📋 सुझाव",
  addTip1: "फ्रिजको भित्री भाग पूरा देखिने गरी खिच्नुस्",
  addTip2: "उज्यालो ठाउँमा बढी सटीक हुन्छ",
  addTip3: "नतिजा सेभ गर्नु अघि सम्पादन गर्न सकिन्छ",
  addBarSelected: (n) => `${n} वटा छानिएको`,
  addBarClear: "हटाउनुस्", addBarAdd: "थप्नुस् →",
  addModalListTitle: (n) => `${n} वटा थप्नुस्`,
  addModalVisionTitle: "AI ले पहिचान गरेको",
  addModalSubtitle: "श्रेणी र म्याद जाँच्नुस्",
  addModalCancel: "रद्द", addModalSave: (n) => `${n} वटा सेभ`,
  addDayUnit: "दिन", addPieceUnit: "वटा",
  recipeOpen: "▼ तरिका हेर्नुस्", recipeClose: "▲ बन्द गर्नुस्", recipeMissing: "चाहिन्छ:",
  demoTitle: "डेमो हेर्नुस्", demoDesc: "नमूना खाना थप्नुस् र AI रेसिपी स्वचालित बनाउनुस्", demoBtn: "🎮 डेमो सुरु", demoLoading: "तयार गर्दैछ…",
  shopTitle: "किनमेल सूची", shopSubtitle: "Shopping", shopDesc: "फ्रिजबाट स्वचालित",
  shopNeed: "अहिलेनै चाहिन्छ", shopSoon: "चाँडै चाहिन्छ", shopExtra: "पाइले ल्याउनुस्",
  shopEmpty: "किन्ने कुरा छैन", shopBought: "किनियो", shopClear: "हटाउनुस्",
  grpLabels: { "すべて":"सबै","野菜":"तरकारी","きのこ":"च्याउ","芋類":"तरुल","魚介":"माछा","肉類":"मासु","卵・乳":"अण्डा/दूध","主食":"मुख्य खाना","調味料":"मसला","スパイス":"मसला","食用油":"तेल","缶詰":"डब्बा","レトルト":"प्याकेट","冷凍品":"फ्रोजन","飲み物":"पेय" },
  locale: "ne-NP", lang: "ne", nameSep: " · ",
  shopItemCount: (n) => `${n} वटा`, shopMemoTitle: "किनमेल नोट", shopVoiceListen: "बोल्नुस्…", shopMemoPlaceholder: "थप्नुस्…", shopVoiceListening: "सुनिरहेको…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "आवाज इनपुट उपलब्ध छैन", shopVoiceHint: "🎙️ माइक, टाइप वा माथिबाट छान्नुस्", shopFullStock: "सामग्री पर्याप्त छ",
  shopVoiceErrHttps: "HTTPS चाहिन्छ", shopVoiceErrBrowser: "ब्राउजर समर्थन छैन (Chrome/Safari)", shopVoiceErrMic: "माइक अनुमति छैन", shopVoiceErrNoSpeech: "आवाज सुनिएन", shopVoiceErrNetwork: "HTTPS मात्र काम गर्छ", shopVoiceErrAudio: "माइक भेटिएन", shopClearCount: (n) => ` (${n})`,
  allergyBtn: "⚠️ एलर्जी सेटिङ", allergyTitle: "नखाने खाना छान्नुस्", allergyDesc: "जे खान सक्नुहुन्न त्यो थिच्नुस्", allergyMandatory: "अनिवार्य एलर्जेन (१० प्रकार)", allergyRecommended: "वैकल्पिक (१८ प्रकार)", allergySave: "सेभ", allergySaveCount: (n) => ` (${n} हटाइएको)`,
  allergenNames: { shrimp:"झिंगा", crab:"गँगटो", walnut:"अखरोट", wheat:"गहुँ", buckwheat:"फापर", egg:"अण्डा", dairy:"दूध", peanut:"बदाम", macadamia:"मकाडेमिया", cashew:"काजु", almond:"बादाम", abalone:"अबलोन", squid:"विद्रुम", salmon_roe:"माछाको अण्डा", orange:"सुन्तला", kiwi:"किवी", beef:"गाईको मासु", sesame:"तिल", salmon:"सालमन", mackerel:"म्याकेरेल", soy:"सोयाबिन", chicken:"कुखुरा", banana:"केरा", pork:"सुँगुरको मासु", peach:"आरु", yam:"तरुल", apple:"स्याउ", gelatin:"जिलेटिन" },
};

// ── Indonesia ────────────────────────────────────────────
const id: T = {
  navHome: "Beranda", navInventory: "Stok", navAdd: "Tambah", navShopping: "Belanja", navLang: "Bahasa", navShare: "Bagikan",
  catFridge: "Kulkas", catFreezer: "Freezer", catVegetable: "Sayuran", catPantry: "Lemari",
  homeSubtitle: "Asisten Makanan AI",
  homeTagline: "Masak cepat dari bahan yang tersisa",
  homeUrgent: (names) => `${names} — gunakan sekarang!`,
  homeWarning: (names) => `${names} — akan kadaluarsa`,
  homePriorityTitle: "Gunakan Segera",
  homeItemCount: (n) => `${n} item`,
  homeEmptyTitle: "Belum ada bahan makanan",
  homeEmptyHint: "Ketuk \"Tambah\" untuk mendaftar",
  homeTodayTitle: "Rekomendasi Hari Ini",
  homeGenerate: "🍽️ Sarankan Menu",
  homeGenerating: "AI sedang berpikir…",
  homeRegenerate: "↻ Coba Lagi",
  homeGenerateDesc: "Sarankan menu yang bisa dibuat sekarang",
  homeErrFetch: "Gagal memuat data",
  homeErrRecipe: "Gagal membuat resep",
  homeUrgentLabel: "Tolong!", homeUrgentTap: "Ketuk untuk resep →",
  homeFridgeScore: "🥬 Skor Kulkas", homeSavingsDesc: (n) => `${n} bahan bisa dipakai hari ini`,
  homeStatusGood: "Aman", homeStatusWarn: "Perhatian", homeStatusUrgent: "Segera",
  homeServings: (n) => `Porsi: ${n}`, homeServingNote: "Bahan menyesuaikan jumlah porsi", homeMissingSend: "Kirim kekurangan ke daftar belanja", homeMissingSent: "Ditambahkan ✓",
  invSubtitle: "Inventaris", invTitle: "Manajemen Stok",
  invNItems: (n) => `${n} bahan`,
  invUrgent: (n) => `${n} akan kadaluarsa!`,
  invTabAll: "Semua", invEmpty: "Tidak ada bahan",
  invToday: "Hari ini!", invDaysLeft: (n) => `${n} hari lagi`,
  invConsume: "Pakai", invEdit: "Ubah", invSave: "Simpan", invDelete: "Hapus", invDeleteConfirm: "Hapus item ini?",
  addSubtitle: "Tambah Makanan", addTitle: "Tambah Bahan",
  addModeList: "🗂 Dari Daftar", addModeManual: "✏️ Manual", addModeCamera: "📸 Kamera",
  addSearch: "Cari bahan...", addSelectedBadge: "✓ Dipilih",
  addNotFound: (q) => `"${q}" tidak ditemukan`,
  addNameLabel: "Nama Bahan *", addNamePlaceholder: "Contoh: Kubis",
  addStorageLabel: "Penyimpanan", addQtyLabel: "Jumlah", addExpiryLabel: "Kadaluarsa (hari)",
  addSubmitting: "Menambahkan...", addSave: "Tambah",
  addErrName: "Masukkan nama bahan", addErrFailed: "Gagal menambahkan",
  addCamTitle: "Foto Kulkas / Freezer",
  addCamDesc1: "AI akan mengidentifikasi bahan secara otomatis",
  addCamDesc2: "Daftarkan banyak bahan sekaligus",
  addCamOpen: "Buka Kamera / File", addCamAnalyzing: "AI sedang mengidentifikasi…",
  addCamErrId: "Identifikasi gagal", addCamErrSave: "Penyimpanan gagal",
  addTipsTitle: "📋 Tips Foto",
  addTip1: "Ambil foto seluruh bagian dalam kulkas",
  addTip2: "Pencahayaan baik meningkatkan akurasi",
  addTip3: "Hasil dapat diedit sebelum disimpan",
  addBarSelected: (n) => `${n} dipilih`,
  addBarClear: "Hapus", addBarAdd: "Tambah →",
  addModalListTitle: (n) => `Tambah ${n} bahan`,
  addModalVisionTitle: "Teridentifikasi oleh AI",
  addModalSubtitle: "Periksa kategori dan tanggal kadaluarsa",
  addModalCancel: "Batal", addModalSave: (n) => `Simpan ${n}`,
  addDayUnit: "hr", addPieceUnit: "pcs",
  recipeOpen: "▼ Lihat Langkah", recipeClose: "▲ Sembunyikan", recipeMissing: "Perlu:",
  demoTitle: "Coba Demo", demoDesc: "Tambahkan bahan contoh dan buat resep AI otomatis", demoBtn: "🎮 Mulai Demo", demoLoading: "Mempersiapkan…",
  shopTitle: "Daftar Belanja", shopSubtitle: "Shopping", shopDesc: "Dibuat otomatis dari kulkas",
  shopNeed: "Perlu Sekarang", shopSoon: "Hampir Habis", shopExtra: "Sekalian",
  shopEmpty: "Tidak ada yang perlu dibeli", shopBought: "Sudah beli", shopClear: "Hapus selesai",
  grpLabels: { "すべて":"Semua","野菜":"Sayuran","きのこ":"Jamur","芋類":"Umbi","魚介":"Seafood","肉類":"Daging","卵・乳":"Telur/Susu","主食":"Makanan Pokok","調味料":"Bumbu","スパイス":"Rempah","食用油":"Minyak","缶詰":"Kaleng","レトルト":"Siap Saji","冷凍品":"Beku","飲み物":"Minuman" },
  locale: "id-ID", lang: "id", nameSep: ", ",
  shopItemCount: (n) => `${n} item`, shopMemoTitle: "Catatan Belanja", shopVoiceListen: "Bicaralah…", shopMemoPlaceholder: "Tambah item…", shopVoiceListening: "Mendengarkan…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "Input suara tidak tersedia", shopVoiceHint: "🎙️ Gunakan mic, ketik, atau pilih kategori", shopFullStock: "Kulkas Anda sudah lengkap",
  shopVoiceErrHttps: "Input suara perlu HTTPS", shopVoiceErrBrowser: "Browser tidak mendukung (gunakan Chrome/Safari)", shopVoiceErrMic: "Mikrofon tidak diizinkan", shopVoiceErrNoSpeech: "Suara tidak terdeteksi", shopVoiceErrNetwork: "Hanya bekerja di HTTPS", shopVoiceErrAudio: "Mikrofon tidak ditemukan", shopClearCount: (n) => ` (${n})`,
  allergyBtn: "⚠️ Pengaturan Alergi", allergyTitle: "Pilih makanan yang tidak bisa dimakan", allergyDesc: "Ketuk item yang tidak bisa Anda makan", allergyMandatory: "Alergen Wajib (10 item)", allergyRecommended: "Alergen Opsional (18 item)", allergySave: "Simpan", allergySaveCount: (n) => ` (${n} dikecualikan)`,
  allergenNames: { shrimp:"Udang", crab:"Kepiting", walnut:"Walnut", wheat:"Gandum", buckwheat:"Gandum Hitam", egg:"Telur", dairy:"Susu", peanut:"Kacang tanah", macadamia:"Macadamia", cashew:"Kacang mete", almond:"Almond", abalone:"Abalon", squid:"Cumi", salmon_roe:"Telur salmon", orange:"Jeruk", kiwi:"Kiwi", beef:"Daging sapi", sesame:"Wijen", salmon:"Salmon", mackerel:"Makarel", soy:"Kedelai", chicken:"Ayam", banana:"Pisang", pork:"Daging babi", peach:"Persik", yam:"Ubi", apple:"Apel", gelatin:"Gelatin" },
};

// ── 中文（简体）─────────────────────────────────────────
const zh: T = {
  navHome: "首页", navInventory: "库存", navAdd: "添加", navShopping: "购物", navLang: "语言", navShare: "分享",
  catFridge: "冷藏", catFreezer: "冷冻", catVegetable: "蔬菜室", catPantry: "常温",
  homeSubtitle: "AI 食物助手",
  homeTagline: "用剩余食材快速做饭",
  homeUrgent: (names) => `${names}，请立即使用！`,
  homeWarning: (names) => `${names}即将过期`,
  homePriorityTitle: "优先使用",
  homeItemCount: (n) => `${n}件`,
  homeEmptyTitle: "尚未添加食材",
  homeEmptyHint: "点击「添加」注册食材",
  homeTodayTitle: "今日推荐",
  homeGenerate: "🍽️ 推荐菜单",
  homeGenerating: "AI 思考中…",
  homeRegenerate: "↻ 再次推荐",
  homeGenerateDesc: "推荐现在就能做的菜肴",
  homeErrFetch: "数据加载失败",
  homeErrRecipe: "食谱生成失败",
  homeUrgentLabel: "救救我！", homeUrgentTap: "点击获取食谱建议 →",
  homeFridgeScore: "🥬 冰箱评分", homeSavingsDesc: (n) => `今天可以节约 ${n} 件食材`,
  homeStatusGood: "一切正常", homeStatusWarn: "注意", homeStatusUrgent: "需要处理",
  homeServings: (n) => `人数：${n}人份`, homeServingNote: "仅食材用量按人数调整", homeMissingSend: "将缺少食材加入购物清单", homeMissingSent: "已添加 ✓",
  invSubtitle: "库存", invTitle: "库存管理",
  invNItems: (n) => `共${n}件食材`,
  invUrgent: (n) => `${n}件即将过期!`,
  invTabAll: "全部", invEmpty: "没有食材",
  invToday: "今天到期！", invDaysLeft: (n) => `还剩${n}天`,
  invConsume: "使用", invEdit: "编辑", invSave: "保存", invDelete: "删除", invDeleteConfirm: "确认删除？",
  addSubtitle: "添加食物", addTitle: "添加食材",
  addModeList: "🗂 从列表", addModeManual: "✏️ 手动输入", addModeCamera: "📸 拍照",
  addSearch: "搜索食材...", addSelectedBadge: "✓ 已选",
  addNotFound: (q) => `未找到「${q}」`,
  addNameLabel: "食材名称 *", addNamePlaceholder: "例：卷心菜",
  addStorageLabel: "存放位置", addQtyLabel: "数量", addExpiryLabel: "保质期（天）",
  addSubmitting: "添加中...", addSave: "添加",
  addErrName: "请输入食材名称", addErrFailed: "添加失败",
  addCamTitle: "拍摄冰箱",
  addCamDesc1: "AI 将自动识别食材",
  addCamDesc2: "一次性登记多种食材",
  addCamOpen: "打开相机 / 文件", addCamAnalyzing: "AI 识别中…",
  addCamErrId: "识别失败", addCamErrSave: "保存失败",
  addTipsTitle: "📋 拍摄技巧",
  addTip1: "拍摄冰箱内部全貌",
  addTip2: "光线充足时识别更准确",
  addTip3: "保存前可以编辑识别结果",
  addBarSelected: (n) => `已选${n}件`,
  addBarClear: "清除", addBarAdd: "添加 →",
  addModalListTitle: (n) => `添加${n}件食材`,
  addModalVisionTitle: "AI 识别的食材",
  addModalSubtitle: "确认类别和保质期",
  addModalCancel: "取消", addModalSave: (n) => `保存${n}件`,
  addDayUnit: "天", addPieceUnit: "个",
  recipeOpen: "▼ 查看步骤", recipeClose: "▲ 收起步骤", recipeMissing: "需要:",
  demoTitle: "试用演示", demoDesc: "添加示例食材，自动生成AI食谱", demoBtn: "🎮 开始演示", demoLoading: "准备中…",
  shopTitle: "购物清单", shopSubtitle: "Shopping", shopDesc: "根据冰箱自动生成",
  shopNeed: "立即需要", shopSoon: "即将用完", shopExtra: "顺便买",
  shopEmpty: "没有需要购买的", shopBought: "已买", shopClear: "清除已完成",
  grpLabels: { "すべて":"全部","野菜":"蔬菜","きのこ":"蘑菇","芋類":"薯类","魚介":"海鲜","肉類":"肉类","卵・乳":"蛋/奶","主食":"主食","調味料":"调味料","スパイス":"香料","食用油":"食用油","缶詰":"罐头","レトルト":"速食包","冷凍品":"冷冻","飲み物":"饮料" },
  locale: "zh-CN", lang: "zh", nameSep: "・",
  shopItemCount: (n) => `${n}种`, shopMemoTitle: "购物备忘", shopVoiceListen: "请说话…", shopMemoPlaceholder: "添加… (例: 酱油)", shopVoiceListening: "正在聆听…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "语音输入不可用", shopVoiceHint: "🎙️ 使用麦克风、输入或选择上方类别", shopFullStock: "冰箱存量充足",
  shopVoiceErrHttps: "语音输入需要HTTPS环境", shopVoiceErrBrowser: "浏览器不支持（请使用Chrome/Safari）", shopVoiceErrMic: "麦克风未授权", shopVoiceErrNoSpeech: "未检测到声音", shopVoiceErrNetwork: "仅在HTTPS下运行", shopVoiceErrAudio: "未找到麦克风", shopClearCount: (n) => `（${n}件）`,
  allergyBtn: "⚠️ 过敏设置", allergyTitle: "选择无法食用的食材", allergyDesc: "点击您无法食用的食材", allergyMandatory: "过敏原（必须 10种）", allergyRecommended: "关注食材（任意 18种）", allergySave: "保存", allergySaveCount: (n) => `（排除${n}种）`,
  allergenNames: { shrimp:"虾", crab:"蟹", walnut:"核桃", wheat:"小麦", buckwheat:"荞麦", egg:"鸡蛋", dairy:"乳制品", peanut:"花生", macadamia:"夏威夷果", cashew:"腰果", almond:"杏仁", abalone:"鲍鱼", squid:"鱿鱼", salmon_roe:"三文鱼子", orange:"橙子", kiwi:"猕猴桃", beef:"牛肉", sesame:"芝麻", salmon:"三文鱼", mackerel:"青花鱼", soy:"大豆", chicken:"鸡肉", banana:"香蕉", pork:"猪肉", peach:"桃子", yam:"山药", apple:"苹果", gelatin:"明胶" },
};

// ── 한국어 ───────────────────────────────────────────────
const ko: T = {
  navHome: "홈", navInventory: "재고", navAdd: "추가", navShopping: "쇼핑", navLang: "언어", navShare: "공유",
  catFridge: "냉장", catFreezer: "냉동", catVegetable: "채소실", catPantry: "상온",
  homeSubtitle: "AI 식재료 관리",
  homeTagline: "남은 재료로 빠른 한 끼",
  homeUrgent: (names) => `${names} — 지금 바로 사용하세요!`,
  homeWarning: (names) => `${names} — 곧 만료됩니다`,
  homePriorityTitle: "먼저 사용할 재료",
  homeItemCount: (n) => `${n}개`,
  homeEmptyTitle: "등록된 식재료가 없습니다",
  homeEmptyHint: "\"추가\"를 탭하여 등록하세요",
  homeTodayTitle: "오늘의 추천",
  homeGenerate: "🍽️ 메뉴 제안받기",
  homeGenerating: "AI가 생각 중…",
  homeRegenerate: "↻ 다시 제안받기",
  homeGenerateDesc: "지금 바로 만들 수 있는 메뉴를 제안합니다",
  homeErrFetch: "데이터 로드 실패",
  homeErrRecipe: "레시피 생성 실패",
  homeUrgentLabel: "살려줘!", homeUrgentTap: "레시피 제안 →",
  homeFridgeScore: "🥬 냉장고 점수", homeSavingsDesc: (n) => `오늘 ${n}개 식재료를 아낄 수 있어요`,
  homeStatusGood: "이상 없음", homeStatusWarn: "주의", homeStatusUrgent: "확인 필요",
  homeServings: (n) => `인원: ${n}인분`, homeServingNote: "재료 양만 인원에 맞게 조정", homeMissingSend: "부족한 재료를 쇼핑 목록에 추가", homeMissingSent: "추가됨 ✓",
  invSubtitle: "Inventory", invTitle: "재고 관리",
  invNItems: (n) => `${n}개 식재료`,
  invUrgent: (n) => `만료 임박 ${n}개!`,
  invTabAll: "전체", invEmpty: "식재료 없음",
  invToday: "오늘까지!", invDaysLeft: (n) => `${n}일 남음`,
  invConsume: "소비", invEdit: "수정", invSave: "저장", invDelete: "삭제", invDeleteConfirm: "삭제하시겠습니까?",
  addSubtitle: "식재료 추가", addTitle: "재료 추가",
  addModeList: "🗂 목록에서", addModeManual: "✏️ 직접 입력", addModeCamera: "📸 사진",
  addSearch: "재료 검색...", addSelectedBadge: "✓ 선택됨",
  addNotFound: (q) => `"${q}" 을(를) 찾을 수 없습니다`,
  addNameLabel: "재료명 *", addNamePlaceholder: "예: 양배추",
  addStorageLabel: "보관 장소", addQtyLabel: "수량", addExpiryLabel: "유통기한 (일)",
  addSubmitting: "추가 중...", addSave: "추가",
  addErrName: "재료명을 입력하세요", addErrFailed: "추가 실패",
  addCamTitle: "냉장고 촬영",
  addCamDesc1: "AI가 자동으로 식재료를 인식합니다",
  addCamDesc2: "여러 재료를 한 번에 등록 가능",
  addCamOpen: "카메라 / 파일 열기", addCamAnalyzing: "AI 인식 중…",
  addCamErrId: "인식 실패", addCamErrSave: "저장 실패",
  addTipsTitle: "📋 촬영 팁",
  addTip1: "냉장고 내부 전체가 보이도록 촬영",
  addTip2: "밝은 곳에서 더 정확한 인식",
  addTip3: "저장 전 결과를 수정할 수 있습니다",
  addBarSelected: (n) => `${n}개 선택됨`,
  addBarClear: "지우기", addBarAdd: "추가 →",
  addModalListTitle: (n) => `${n}개 재료 추가`,
  addModalVisionTitle: "AI가 인식한 식재료",
  addModalSubtitle: "카테고리와 유통기한 확인",
  addModalCancel: "취소", addModalSave: (n) => `${n}개 저장`,
  addDayUnit: "일", addPieceUnit: "개",
  recipeOpen: "▼ 만드는 법 보기", recipeClose: "▲ 접기", recipeMissing: "필요:",
  demoTitle: "데모 체험", demoDesc: "샘플 재료를 추가하고 AI 레시피를 자동 생성합니다", demoBtn: "🎮 데모 시작", demoLoading: "준비 중…",
  shopTitle: "쇼핑 목록", shopSubtitle: "Shopping", shopDesc: "냉장고에서 자동 생성",
  shopNeed: "지금 필요", shopSoon: "곧 필요", shopExtra: "사는 김에",
  shopEmpty: "살 것이 없습니다", shopBought: "구매함", shopClear: "완료 지우기",
  grpLabels: { "すべて":"전체","野菜":"채소","きのこ":"버섯","芋類":"감자류","魚介":"해산물","肉類":"육류","卵・乳":"달걀/유제품","主食":"주식","調味料":"양념","スパイス":"향신료","食用油":"식용유","缶詰":"통조림","レトルト":"레토르트","冷凍品":"냉동","飲み物":"음료" },
  locale: "ko-KR", lang: "ko", nameSep: "・",
  shopItemCount: (n) => `${n}개`, shopMemoTitle: "쇼핑 메모", shopVoiceListen: "말씀하세요…", shopMemoPlaceholder: "추가… (예: 간장)", shopVoiceListening: "듣는 중…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "음성 입력 불가", shopVoiceHint: "🎙️ 마이크, 입력 또는 위 카테고리 선택", shopFullStock: "재료가 충분합니다",
  shopVoiceErrHttps: "음성 입력은 HTTPS 필요", shopVoiceErrBrowser: "브라우저 미지원 (Chrome/Safari 사용)", shopVoiceErrMic: "마이크 권한 없음", shopVoiceErrNoSpeech: "음성 미감지", shopVoiceErrNetwork: "HTTPS에서만 작동", shopVoiceErrAudio: "마이크 없음", shopClearCount: (n) => ` (${n}개)`,
  allergyBtn: "⚠️ 알레르기 설정", allergyTitle: "못 먹는 식재료를 선택하세요", allergyDesc: "먹을 수 없는 항목을 탭하세요", allergyMandatory: "의무 표시 알레르겐 (10종)", allergyRecommended: "권장 표시 (18종)", allergySave: "저장", allergySaveCount: (n) => ` (${n}종 제외)`,
  allergenNames: { shrimp:"새우", crab:"게", walnut:"호두", wheat:"밀", buckwheat:"메밀", egg:"달걀", dairy:"우유", peanut:"땅콩", macadamia:"마카다미아", cashew:"캐슈넛", almond:"아몬드", abalone:"전복", squid:"오징어", salmon_roe:"연어알", orange:"오렌지", kiwi:"키위", beef:"쇠고기", sesame:"참깨", salmon:"연어", mackerel:"고등어", soy:"대두", chicken:"닭고기", banana:"바나나", pork:"돼지고기", peach:"복숭아", yam:"마", apple:"사과", gelatin:"젤라틴" },
};

// ── Português (Brasil) ──────────────────────────────────
const pt: T = {
  navHome: "Início", navInventory: "Estoque", navAdd: "Adicionar", navShopping: "Compras", navLang: "Idioma", navShare: "Compartilhar",
  catFridge: "Geladeira", catFreezer: "Freezer", catVegetable: "Legumes", catPantry: "Despensa",
  homeSubtitle: "Assistente de Alimentos IA",
  homeTagline: "Refeição rápida com o que sobrou",
  homeUrgent: (names) => `Use ${names} agora!`,
  homeWarning: (names) => `${names} — vencendo em breve`,
  homePriorityTitle: "Use Primeiro",
  homeItemCount: (n) => `${n} itens`,
  homeEmptyTitle: "Nenhum alimento cadastrado",
  homeEmptyHint: "Toque em \"Adicionar\" para cadastrar",
  homeTodayTitle: "Sugestões de Hoje",
  homeGenerate: "🍽️ Sugerir Refeição",
  homeGenerating: "IA pensando…",
  homeRegenerate: "↻ Tentar Novamente",
  homeGenerateDesc: "Sugerir refeições que você pode fazer agora",
  homeErrFetch: "Erro ao carregar dados",
  homeErrRecipe: "Erro ao gerar receitas",
  homeUrgentLabel: "Me ajuda!", homeUrgentTap: "Toque para sugestões de receita →",
  homeFridgeScore: "🥬 Nota Geladeira", homeSavingsDesc: (n) => `${n} itens para usar hoje`,
  homeStatusGood: "Tudo certo", homeStatusWarn: "Atenção", homeStatusUrgent: "Urgente",
  homeServings: (n) => `Porções: ${n}`, homeServingNote: "Ingredientes ajustam por porção", homeMissingSend: "Enviar faltando para lista de compras", homeMissingSent: "Adicionado ✓",
  invSubtitle: "Estoque", invTitle: "Gestão de Estoque",
  invNItems: (n) => `${n} alimentos`,
  invUrgent: (n) => `${n} vencendo!`,
  invTabAll: "Todos", invEmpty: "Sem alimentos",
  invToday: "Hoje!", invDaysLeft: (n) => `${n}d restantes`,
  invConsume: "Usar", invEdit: "Editar", invSave: "Salvar", invDelete: "Excluir", invDeleteConfirm: "Excluir este item?",
  addSubtitle: "Adicionar Alimento", addTitle: "Adicionar Ingrediente",
  addModeList: "🗂 Da Lista", addModeManual: "✏️ Manual", addModeCamera: "📸 Câmera",
  addSearch: "Buscar ingredientes...", addSelectedBadge: "✓ Selecionado",
  addNotFound: (q) => `"${q}" não encontrado`,
  addNameLabel: "Ingrediente *", addNamePlaceholder: "Ex: Repolho",
  addStorageLabel: "Armazenamento", addQtyLabel: "Qtd", addExpiryLabel: "Validade (dias)",
  addSubmitting: "Adicionando...", addSave: "Adicionar",
  addErrName: "Insira o nome do ingrediente", addErrFailed: "Falha ao adicionar",
  addCamTitle: "Fotografar Geladeira / Freezer",
  addCamDesc1: "IA identificará os ingredientes automaticamente",
  addCamDesc2: "Cadastre vários itens de uma vez",
  addCamOpen: "Abrir Câmera / Arquivo", addCamAnalyzing: "IA identificando…",
  addCamErrId: "Falha na identificação", addCamErrSave: "Falha ao salvar",
  addTipsTitle: "📋 Dicas de Foto",
  addTip1: "Capture o interior completo da geladeira",
  addTip2: "Boa iluminação melhora a precisão",
  addTip3: "Você pode editar os resultados antes de salvar",
  addBarSelected: (n) => `${n} selecionado(s)`,
  addBarClear: "Limpar", addBarAdd: "Adicionar →",
  addModalListTitle: (n) => `Adicionar ${n} ingredientes`,
  addModalVisionTitle: "Identificado pela IA",
  addModalSubtitle: "Verifique categoria e validade",
  addModalCancel: "Cancelar", addModalSave: (n) => `Salvar ${n}`,
  addDayUnit: "d", addPieceUnit: "un",
  recipeOpen: "▼ Ver Preparo", recipeClose: "▲ Ocultar", recipeMissing: "Necessário:",
  demoTitle: "Experimente o Demo", demoDesc: "Adicione ingredientes de exemplo e gere receitas AI automaticamente", demoBtn: "🎮 Iniciar Demo", demoLoading: "Preparando…",
  shopTitle: "Lista de Compras", shopSubtitle: "Shopping", shopDesc: "Gerado automaticamente",
  shopNeed: "Preciso Agora", shopSoon: "Logo Vai Acabar", shopExtra: "Já Que Vai",
  shopEmpty: "Nada para comprar", shopBought: "Comprei", shopClear: "Limpar feitos",
  grpLabels: { "すべて":"Todos","野菜":"Vegetal","きのこ":"Cogumelo","芋類":"Tubérculo","魚介":"Frutos do Mar","肉類":"Carne","卵・乳":"Ovo/Leite","主食":"Carboidrato","調味料":"Tempero","スパイス":"Especiaria","食用油":"Óleo","缶詰":"Conservas","レトルト":"Pronto","冷凍品":"Congelado","飲み物":"Bebidas" },
  locale: "pt-BR", lang: "pt", nameSep: " · ",
  shopItemCount: (n) => `${n} itens`, shopMemoTitle: "Notas de Compra", shopVoiceListen: "Fale agora…", shopMemoPlaceholder: "Adicionar… (ex: molho de soja)", shopVoiceListening: "Ouvindo…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "Entrada de voz indisponível", shopVoiceHint: "🎙️ Use mic, digitar ou selecionar categoria", shopFullStock: "Sua geladeira está bem abastecida",
  shopVoiceErrHttps: "Entrada de voz requer HTTPS", shopVoiceErrBrowser: "Navegador não suporta (tente Chrome/Safari)", shopVoiceErrMic: "Microfone não permitido", shopVoiceErrNoSpeech: "Nenhuma fala detectada", shopVoiceErrNetwork: "Funciona apenas em HTTPS", shopVoiceErrAudio: "Microfone não encontrado", shopClearCount: (n) => ` (${n})`,
  allergyBtn: "⚠️ Configurar Alergias", allergyTitle: "Selecione o que não pode comer", allergyDesc: "Toque nos alimentos que você não pode comer", allergyMandatory: "Alérgenos Obrigatórios (10 itens)", allergyRecommended: "Alérgenos Opcionais (18 itens)", allergySave: "Salvar", allergySaveCount: (n) => ` (${n} excluídos)`,
  allergenNames: { shrimp:"Camarão", crab:"Caranguejo", walnut:"Nozes", wheat:"Trigo", buckwheat:"Trigo sarraceno", egg:"Ovo", dairy:"Laticínios", peanut:"Amendoim", macadamia:"Macadâmia", cashew:"Caju", almond:"Amêndoa", abalone:"Orelha-de-mar", squid:"Lula", salmon_roe:"Ovas de salmão", orange:"Laranja", kiwi:"Kiwi", beef:"Carne bovina", sesame:"Gergelim", salmon:"Salmão", mackerel:"Cavala", soy:"Soja", chicken:"Frango", banana:"Banana", pork:"Carne de porco", peach:"Pêssego", yam:"Inhame", apple:"Maçã", gelatin:"Gelatina" },
};

// ── ภาษาไทย ──────────────────────────────────────────────
const th: T = {
  navHome: "หน้าหลัก", navInventory: "คลัง", navAdd: "เพิ่ม", navShopping: "ช้อป", navLang: "ภาษา", navShare: "แชร์",
  catFridge: "ตู้เย็น", catFreezer: "ช่องแช่แข็ง", catVegetable: "ผักสด", catPantry: "ของแห้ง",
  homeSubtitle: "ผู้ช่วย AI ด้านอาหาร",
  homeTagline: "ทำอาหารเร็วจากวัตถุดิบที่เหลือ",
  homeUrgent: (names) => `ใช้ ${names} ด่วน!`,
  homeWarning: (names) => `${names} — ใกล้หมดอายุ`,
  homePriorityTitle: "ใช้ก่อน",
  homeItemCount: (n) => `${n} รายการ`,
  homeEmptyTitle: "ยังไม่มีวัตถุดิบ",
  homeEmptyHint: "แตะ \"เพิ่ม\" เพื่อลงทะเบียน",
  homeTodayTitle: "แนะนำวันนี้",
  homeGenerate: "🍽️ แนะนำเมนู",
  homeGenerating: "AI กำลังคิด…",
  homeRegenerate: "↻ แนะนำอีกครั้ง",
  homeGenerateDesc: "แนะนำเมนูที่ทำได้ทันทีจากวัตถุดิบของคุณ",
  homeErrFetch: "โหลดข้อมูลไม่ได้",
  homeErrRecipe: "สร้างสูตรไม่ได้",
  homeUrgentLabel: "ช่วยด้วย!", homeUrgentTap: "แตะเพื่อรับสูตรอาหาร →",
  homeFridgeScore: "🥬 คะแนนตู้เย็น", homeSavingsDesc: (n) => `วันนี้ใช้ได้ ${n} รายการ`,
  homeStatusGood: "ปกติ", homeStatusWarn: "ระวัง", homeStatusUrgent: "ด่วน",
  homeServings: (n) => `สำหรับ: ${n} คน`, homeServingNote: "ปรับแค่ปริมาณวัตถุดิบ", homeMissingSend: "ส่งรายการขาดไปยังช้อปปิ้ง", homeMissingSent: "เพิ่มแล้ว ✓",
  invSubtitle: "คลังวัตถุดิบ", invTitle: "จัดการคลัง",
  invNItems: (n) => `${n} รายการ`,
  invUrgent: (n) => `ใกล้หมดอายุ ${n} รายการ!`,
  invTabAll: "ทั้งหมด", invEmpty: "ไม่มีวัตถุดิบ",
  invToday: "วันนี้!", invDaysLeft: (n) => `เหลือ ${n} วัน`,
  invConsume: "ใช้", invEdit: "แก้ไข", invSave: "บันทึก", invDelete: "ลบ", invDeleteConfirm: "ลบรายการนี้?",
  addSubtitle: "เพิ่มอาหาร", addTitle: "เพิ่มวัตถุดิบ",
  addModeList: "🗂 จากรายการ", addModeManual: "✏️ กรอกเอง", addModeCamera: "📸 ถ่ายรูป",
  addSearch: "ค้นหาวัตถุดิบ...", addSelectedBadge: "✓ เลือกแล้ว",
  addNotFound: (q) => `ไม่พบ "${q}"`,
  addNameLabel: "ชื่อวัตถุดิบ *", addNamePlaceholder: "เช่น: กะหล่ำปลี",
  addStorageLabel: "ที่เก็บ", addQtyLabel: "จำนวน", addExpiryLabel: "หมดอายุ (วัน)",
  addSubmitting: "กำลังเพิ่ม...", addSave: "เพิ่ม",
  addErrName: "กรุณากรอกชื่อวัตถุดิบ", addErrFailed: "เพิ่มไม่สำเร็จ",
  addCamTitle: "ถ่ายรูปตู้เย็น",
  addCamDesc1: "AI จะระบุวัตถุดิบอัตโนมัติ",
  addCamDesc2: "ลงทะเบียนหลายรายการพร้อมกัน",
  addCamOpen: "เปิดกล้อง / ไฟล์", addCamAnalyzing: "AI กำลังระบุ…",
  addCamErrId: "ระบุไม่สำเร็จ", addCamErrSave: "บันทึกไม่สำเร็จ",
  addTipsTitle: "📋 เคล็ดลับ",
  addTip1: "ถ่ายให้เห็นภายในตู้เย็นทั้งหมด",
  addTip2: "แสงสว่างดีจะช่วยให้แม่นยำขึ้น",
  addTip3: "แก้ไขผลลัพธ์ได้ก่อนบันทึก",
  addBarSelected: (n) => `เลือก ${n} รายการ`,
  addBarClear: "ล้าง", addBarAdd: "เพิ่ม →",
  addModalListTitle: (n) => `เพิ่ม ${n} รายการ`,
  addModalVisionTitle: "รายการที่ AI ระบุ",
  addModalSubtitle: "ตรวจสอบหมวดหมู่และวันหมดอายุ",
  addModalCancel: "ยกเลิก", addModalSave: (n) => `บันทึก ${n} รายการ`,
  addDayUnit: "วัน", addPieceUnit: "ชิ้น",
  recipeOpen: "▼ ดูวิธีทำ", recipeClose: "▲ ปิด", recipeMissing: "ต้องการ:",
  demoTitle: "ลองดูเดโม", demoDesc: "เพิ่มวัตถุดิบตัวอย่างและสร้างสูตรอาหาร AI อัตโนมัติ", demoBtn: "🎮 เริ่มเดโม", demoLoading: "กำลังเตรียม…",
  shopTitle: "รายการช้อปปิ้ง", shopSubtitle: "Shopping", shopDesc: "สร้างอัตโนมัติจากตู้เย็น",
  shopNeed: "ต้องการทันที", shopSoon: "ใกล้หมด", shopExtra: "ซื้อตามทาง",
  shopEmpty: "ไม่มีของที่ต้องซื้อ", shopBought: "ซื้อแล้ว", shopClear: "ล้างที่เสร็จ",
  grpLabels: { "すべて":"ทั้งหมด","野菜":"ผัก","きのこ":"เห็ด","芋類":"หัวมัน","魚介":"อาหารทะเล","肉類":"เนื้อสัตว์","卵・乳":"ไข่/นม","主食":"อาหารหลัก","調味料":"เครื่องปรุง","スパイス":"เครื่องเทศ","食用油":"น้ำมัน","缶詰":"กระป๋อง","レトルト":"อาหารซอง","冷凍品":"แช่แข็ง","飲み物":"เครื่องดื่ม" },
  locale: "th-TH", lang: "th", nameSep: " · ",
  shopItemCount: (n) => `${n} รายการ`, shopMemoTitle: "บันทึกช้อปปิ้ง", shopVoiceListen: "พูดได้เลย…", shopMemoPlaceholder: "เพิ่มสินค้า…", shopVoiceListening: "กำลังฟัง…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "ไม่สามารถใช้เสียง", shopVoiceHint: "🎙️ ใช้ไมค์ พิมพ์ หรือเลือกหมวดหมู่", shopFullStock: "ตู้เย็นของคุณสมบูรณ์แล้ว",
  shopVoiceErrHttps: "ต้องการ HTTPS", shopVoiceErrBrowser: "เบราว์เซอร์ไม่รองรับ (ลอง Chrome/Safari)", shopVoiceErrMic: "ไมโครโฟนไม่ได้รับอนุญาต", shopVoiceErrNoSpeech: "ไม่ตรวจพบเสียง", shopVoiceErrNetwork: "ทำงานได้เฉพาะ HTTPS", shopVoiceErrAudio: "ไม่พบไมโครโฟน", shopClearCount: (n) => ` (${n})`,
  allergyBtn: "⚠️ ตั้งค่าแพ้อาหาร", allergyTitle: "เลือกอาหารที่แพ้", allergyDesc: "แตะสิ่งที่คุณไม่สามารถกินได้", allergyMandatory: "สารก่อภูมิแพ้บังคับ (10 รายการ)", allergyRecommended: "ทางเลือก (18 รายการ)", allergySave: "บันทึก", allergySaveCount: (n) => ` (ยกเว้น ${n} รายการ)`,
  allergenNames: { shrimp:"กุ้ง", crab:"ปู", walnut:"วอลนัท", wheat:"ข้าวสาลี", buckwheat:"บัควีต", egg:"ไข่", dairy:"นม", peanut:"ถั่วลิสง", macadamia:"แมคาเดเมีย", cashew:"มะม่วงหิมพานต์", almond:"อัลมอนด์", abalone:"หอยเป๋าฮื้อ", squid:"ปลาหมึก", salmon_roe:"ไข่ปลาแซลมอน", orange:"ส้ม", kiwi:"กีวี", beef:"เนื้อวัว", sesame:"งา", salmon:"แซลมอน", mackerel:"ปลาทู", soy:"ถั่วเหลือง", chicken:"ไก่", banana:"กล้วย", pork:"หมู", peach:"พีช", yam:"มันเทศ", apple:"แอปเปิ้ล", gelatin:"เจลาติน" },
};

// ── 繁體中文（台灣）─────────────────────────────────────
const zhTW: T = {
  navHome: "首頁", navInventory: "庫存", navAdd: "新增", navShopping: "購物", navLang: "語言", navShare: "分享",
  catFridge: "冷藏", catFreezer: "冷凍", catVegetable: "蔬菜室", catPantry: "常溫",
  homeSubtitle: "AI 食材助手",
  homeTagline: "用剩餘食材輕鬆做飯",
  homeUrgent: (names) => `${names}，請立即使用！`,
  homeWarning: (names) => `${names}即將到期`,
  homePriorityTitle: "優先使用",
  homeItemCount: (n) => `${n}件`,
  homeEmptyTitle: "尚未新增食材",
  homeEmptyHint: "點選「新增」來登錄食材",
  homeTodayTitle: "今日推薦",
  homeGenerate: "🍽️ 推薦菜單",
  homeGenerating: "AI 思考中…",
  homeRegenerate: "↻ 再次推薦",
  homeGenerateDesc: "推薦現在就能做的菜餚",
  homeErrFetch: "資料載入失敗",
  homeErrRecipe: "食譜生成失敗",
  homeUrgentLabel: "救救我！", homeUrgentTap: "點擊獲取食譜建議 →",
  homeFridgeScore: "🥬 冰箱評分", homeSavingsDesc: (n) => `今天可以節約 ${n} 件食材`,
  homeStatusGood: "一切正常", homeStatusWarn: "注意", homeStatusUrgent: "需要處理",
  homeServings: (n) => `人數：${n}人份`, homeServingNote: "僅食材用量依人數調整", homeMissingSend: "將缺少食材加入購物清單", homeMissingSent: "已新增 ✓",
  invSubtitle: "庫存", invTitle: "庫存管理",
  invNItems: (n) => `共${n}件食材`,
  invUrgent: (n) => `${n}件即將到期!`,
  invTabAll: "全部", invEmpty: "沒有食材",
  invToday: "今天到期！", invDaysLeft: (n) => `還剩${n}天`,
  invConsume: "使用", invEdit: "編輯", invSave: "儲存", invDelete: "刪除", invDeleteConfirm: "確認刪除？",
  addSubtitle: "新增食物", addTitle: "新增食材",
  addModeList: "🗂 從清單", addModeManual: "✏️ 手動輸入", addModeCamera: "📸 拍照",
  addSearch: "搜尋食材...", addSelectedBadge: "✓ 已選取",
  addNotFound: (q) => `找不到「${q}」`,
  addNameLabel: "食材名稱 *", addNamePlaceholder: "例：高麗菜",
  addStorageLabel: "存放位置", addQtyLabel: "數量", addExpiryLabel: "保存期限（天）",
  addSubmitting: "新增中...", addSave: "新增",
  addErrName: "請輸入食材名稱", addErrFailed: "新增失敗",
  addCamTitle: "拍攝冰箱",
  addCamDesc1: "AI 將自動識別食材",
  addCamDesc2: "一次登錄多種食材",
  addCamOpen: "開啟相機 / 檔案", addCamAnalyzing: "AI 識別中…",
  addCamErrId: "識別失敗", addCamErrSave: "儲存失敗",
  addTipsTitle: "📋 拍攝技巧",
  addTip1: "拍攝冰箱內部全貌",
  addTip2: "光線充足時識別更準確",
  addTip3: "儲存前可以編輯識別結果",
  addBarSelected: (n) => `已選取${n}件`,
  addBarClear: "清除", addBarAdd: "新增 →",
  addModalListTitle: (n) => `新增${n}件食材`,
  addModalVisionTitle: "AI 識別的食材",
  addModalSubtitle: "確認類別和保存期限",
  addModalCancel: "取消", addModalSave: (n) => `儲存${n}件`,
  addDayUnit: "天", addPieceUnit: "個",
  recipeOpen: "▼ 查看步驟", recipeClose: "▲ 收起步驟", recipeMissing: "需要:",
  demoTitle: "試用示範", demoDesc: "新增範例食材，自動生成 AI 食譜", demoBtn: "🎮 開始示範", demoLoading: "準備中…",
  shopTitle: "購物清單", shopSubtitle: "Shopping", shopDesc: "根據冰箱自動生成",
  shopNeed: "立即需要", shopSoon: "即將用完", shopExtra: "順便買",
  shopEmpty: "沒有需要購買的", shopBought: "已買", shopClear: "清除已完成",
  grpLabels: { "すべて":"全部","野菜":"蔬菜","きのこ":"菇類","芋類":"薯類","魚介":"海鮮","肉類":"肉類","卵・乳":"蛋/奶","主食":"主食","調味料":"調味料","スパイス":"香料","食用油":"食用油","缶詰":"罐頭","レトルト":"即食包","冷凍品":"冷凍","飲み物":"飲料" },
  locale: "zh-TW", lang: "zhTW", nameSep: "・",
  shopItemCount: (n) => `${n}種`, shopMemoTitle: "購物備忘", shopVoiceListen: "請說話…", shopMemoPlaceholder: "新增… (例: 醬油)", shopVoiceListening: "正在聆聽…", shopVoiceInterim: (t) => `"${t}"`, shopVoiceErr: "語音輸入不可用", shopVoiceHint: "🎙️ 使用麥克風、輸入或選擇上方類別", shopFullStock: "冰箱存量充足",
  shopVoiceErrHttps: "語音輸入需要HTTPS環境", shopVoiceErrBrowser: "瀏覽器不支援（請使用Chrome/Safari）", shopVoiceErrMic: "麥克風未授權", shopVoiceErrNoSpeech: "未偵測到聲音", shopVoiceErrNetwork: "僅在HTTPS下運作", shopVoiceErrAudio: "未找到麥克風", shopClearCount: (n) => `（${n}件）`,
  allergyBtn: "⚠️ 過敏設定", allergyTitle: "選擇無法食用的食材", allergyDesc: "點擊您無法食用的食材", allergyMandatory: "過敏原（必須 10種）", allergyRecommended: "關注食材（任意 18種）", allergySave: "儲存", allergySaveCount: (n) => `（排除${n}種）`,
  allergenNames: { shrimp:"蝦", crab:"蟹", walnut:"核桃", wheat:"小麥", buckwheat:"蕎麥", egg:"雞蛋", dairy:"乳製品", peanut:"花生", macadamia:"夏威夷豆", cashew:"腰果", almond:"杏仁", abalone:"鮑魚", squid:"魷魚", salmon_roe:"鮭魚卵", orange:"柳橙", kiwi:"奇異果", beef:"牛肉", sesame:"芝麻", salmon:"鮭魚", mackerel:"鯖魚", soy:"大豆", chicken:"雞肉", banana:"香蕉", pork:"豬肉", peach:"桃子", yam:"山藥", apple:"蘋果", gelatin:"明膠" },
};

export const translations: Record<Lang, T> = {
  ja, en, vi, my, ne, id, zh, ko, pt, th, "zh-TW": zhTW,
};

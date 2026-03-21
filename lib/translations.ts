/**
 * チーム・選手名の日本語訳マッピング
 * チームはfootball-data.orgのIDで管理、選手は英語名で管理
 */

// ── チーム日本語名 ────────────────────────────────────────────

const TEAM_NAMES_JA: Record<number, { name: string; shortName: string }> = {
  57:   { name: "アーセナル FC",                        shortName: "アーセナル" },
  58:   { name: "アストン・ヴィラ",                       shortName: "アストン・ヴィラ" },
  61:   { name: "チェルシー FC",                        shortName: "チェルシー" },
  62:   { name: "エヴァートン FC",                      shortName: "エヴァートン" },
  63:   { name: "フラム FC",                            shortName: "フラム" },
  64:   { name: "リヴァプール FC",                      shortName: "リヴァプール" },
  65:   { name: "マンチェスター・シティ FC",               shortName: "マン・シティ" },
  66:   { name: "マンチェスター・ユナイテッド FC",          shortName: "マン・ユナイテッド" },
  67:   { name: "ニューカッスル・ユナイテッド FC",          shortName: "ニューカッスル" },
  73:   { name: "トッテナム・ホットスパー FC",             shortName: "トッテナム" },
  76:   { name: "ウォルヴァーハンプトン・ワンダラーズ FC",  shortName: "ウォルヴズ" },
  338:  { name: "レスター・シティ FC",                   shortName: "レスター" },
  340:  { name: "サウサンプトン FC",                    shortName: "サウサンプトン" },
  349:  { name: "イプスウィッチ・タウン FC",              shortName: "イプスウィッチ" },
  351:  { name: "ノッティンガム・フォレスト FC",           shortName: "フォレスト" },
  354:  { name: "クリスタル・パレス FC",                 shortName: "クリスタル・パレス" },
  397:  { name: "ブライトン & ホーヴ・アルビオン FC",      shortName: "ブライトン" },
  402:  { name: "ブレントフォード FC",                   shortName: "ブレントフォード" },
  563:  { name: "ウェストハム・ユナイテッド FC",           shortName: "ウェストハム" },
  1044: { name: "AFC ボーンマス",                       shortName: "ボーンマス" },
};

export function getTeamNameJa(teamId: number): string | null {
  return TEAM_NAMES_JA[teamId]?.name ?? null;
}

export function getTeamShortNameJa(teamId: number): string | null {
  return TEAM_NAMES_JA[teamId]?.shortName ?? null;
}

// ── 選手日本語名 ─────────────────────────────────────────────
// 日本人選手は漢字、それ以外はカタカナ

const PLAYER_NAMES_JA: Record<string, string> = {
  // ─── Arsenal ───────────────────────────────────────
  "Bukayo Saka":           "ブカヨ・サカ",
  "Martin Ødegaard":       "マルティン・ウーデゴール",
  "Kai Havertz":           "カイ・ハヴァーツ",
  "Gabriel Martinelli":    "ガブリエウ・マルティネッリ",
  "Leandro Trossard":      "レアンドロ・トロサール",
  "William Saliba":        "ウィリアム・サリバ",
  "Declan Rice":           "デクラン・ライス",
  "Gabriel Jesus":         "ガブリエウ・ジェズス",
  "Raheem Sterling":       "ラヒーム・スターリング",
  "David Raya":            "ダビド・ラヤ",
  "Ben White":             "ベン・ホワイト",
  "Gabriel Magalhães":     "ガブリエウ・マガリャンイス",
  "Jurriën Timber":        "ユリエン・ティンバー",
  "Thomas Partey":         "トーマス・パーティ",

  // ─── Aston Villa ───────────────────────────────────
  "Ollie Watkins":         "オリー・ワトキンス",
  "Emiliano Martínez":     "エミリアーノ・マルティネス",
  "Leon Bailey":           "レオン・ベイリー",
  "Moussa Diaby":          "ムサ・ディアビ",
  "John McGinn":           "ジョン・マクギン",
  "Pau Torres":            "パウ・トーレス",
  "Amadou Onana":          "アマドゥ・オナナ",
  "Youri Tielemans":       "ユーリ・ティーレマンス",
  "Morgan Rogers":         "モーガン・ロジャーズ",
  "Diego Carlos":          "ディエゴ・カルロス",

  // ─── Chelsea ───────────────────────────────────────
  "Cole Palmer":           "コール・パーマー",
  "Nicolas Jackson":       "ニコラス・ジャクソン",
  "Reece James":           "リース・ジェームズ",
  "Enzo Fernández":        "エンソ・フェルナンデス",
  "Moisés Caicedo":        "モイセス・カイセド",
  "Christopher Nkunku":    "クリストファー・エンクンク",
  "Malo Gusto":            "マロ・ギュスト",
  "Ben Chilwell":          "ベン・チルウェル",
  "Pedro Neto":            "ペドロ・ネト",
  "Filip Jørgensen":       "フィリップ・ヨルゲンセン",
  "Noni Madueke":          "ノニ・マドゥエケ",

  // ─── Everton ───────────────────────────────────────
  "Dominic Calvert-Lewin": "ドミニク・カルバート＝ルーウィン",
  "Jarrad Branthwaite":    "ジャラッド・ブラントウェイト",
  "Dwight McNeil":         "ドワイト・マクニール",
  "Iliman Ndiaye":         "イリマン・ンジャイ",
  "Abdoulaye Doucouré":    "アブドゥライ・ドゥクレ",

  // ─── Fulham ────────────────────────────────────────
  "Raúl Jiménez":          "ラウル・ヒメネス",
  "Harry Wilson":          "ハリー・ウィルソン",
  "Andreas Pereira":       "アンドレアス・ペレイラ",
  "Alex Iwobi":            "アレックス・イウォビ",
  "Bernd Leno":            "ベルント・レノ",
  "Kenny Tete":            "ケニー・テテ",

  // ─── Liverpool ─────────────────────────────────────
  "Mohamed Salah":          "モハメド・サラー",
  "Virgil van Dijk":        "フィルジル・ファン・ダイク",
  "Trent Alexander-Arnold": "トレント・アレクサンダー＝アーノルド",
  "Alisson Becker":         "アリソン・ベッカー",
  "Dominik Szoboszlai":     "ドミニク・ソボスライ",
  "Darwin Núñez":           "ダルウィン・ヌニェス",
  "Alexis Mac Allister":    "アレクシス・マック・アリスター",
  "Diogo Jota":             "ジオゴ・ジョタ",
  "Cody Gakpo":             "コーディ・ハークポ",
  "Luis Díaz":              "ルイス・ディアス",
  "Andy Robertson":         "アンディ・ロバートソン",
  "Ryan Gravenberch":       "ライアン・フラフェンベルフ",
  "Federico Chiesa":        "フェデリコ・キエーザ",
  "Harvey Elliott":         "ハーヴェイ・エリオット",

  // ─── Manchester City ───────────────────────────────
  "Erling Haaland":        "エルリング・ハーランド",
  "Kevin De Bruyne":       "ケビン・デ・ブライネ",
  "Phil Foden":            "フィル・フォーデン",
  "Jack Grealish":         "ジャック・グリーリッシュ",
  "Bernardo Silva":        "ベルナルド・シウバ",
  "Rúben Dias":            "ルベン・ディアス",
  "Ederson":               "エデルソン",
  "Rodrigo":               "ロドリ",
  "Ilkay Gündogan":        "イルカイ・ギュンドアン",
  "Manuel Akanji":         "マヌエル・アカンジ",
  "Kyle Walker":           "カイル・ウォーカー",
  "Jeremy Doku":           "ジェレミー・ドク",
  "Matheus Nunes":         "マテウス・ヌネス",
  "Josko Gvardiol":        "ヨシュコ・グヴァルディオル",
  "Savinho":               "サヴィーニョ",
  "Stefan Ortega":         "ステファン・オルテガ",

  // ─── Manchester United ─────────────────────────────
  "Marcus Rashford":       "マーカス・ラッシュフォード",
  "Bruno Fernandes":       "ブルーノ・フェルナンデス",
  "Rasmus Højlund":        "ラスムス・ホイルンド",
  "André Onana":           "アンドレ・オナナ",
  "Lisandro Martínez":     "リサンドロ・マルティネス",
  "Casemiro":              "カゼミロ",
  "Alejandro Garnacho":    "アレハンドロ・ガルナチョ",
  "Mason Mount":           "メイソン・マウント",
  "Amad Diallo":           "アマド・ディアロ",
  "Luke Shaw":             "ルーク・ショー",
  "Kobbie Mainoo":         "コビー・マイヌー",
  "Joshua Zirkzee":        "ヨシュア・ジルクゼー",

  // ─── Newcastle United ──────────────────────────────
  "Alexander Isak":        "アレクサンダー・イサク",
  "Nick Pope":             "ニック・ポープ",
  "Bruno Guimarães":       "ブルーノ・ギマランイス",
  "Anthony Gordon":        "アンソニー・ゴードン",
  "Fabian Schär":          "ファビアン・シェア",
  "Kieran Trippier":       "キーラン・トリッピアー",
  "Joelinton":             "ジョエリントン",
  "Harvey Barnes":         "ハーヴェイ・バーンズ",
  "Sandro Tonali":         "サンドロ・トナーリ",
  "Miguel Almirón":        "ミゲル・アルミロン",
  "Callum Wilson":         "カラム・ウィルソン",

  // ─── Tottenham Hotspur ─────────────────────────────
  "Son Heung-min":         "ソン・フンミン",
  "James Maddison":        "ジェームズ・マディソン",
  "Dejan Kulusevski":      "デヤン・クルゼフスキ",
  "Guglielmo Vicario":     "グリエルモ・ヴィカリオ",
  "Pedro Porro":           "ペドロ・ポロ",
  "Micky van de Ven":      "ミッキー・ファン・デ・フェン",
  "Richarlison":           "リシャルリソン",
  "Yves Bissouma":         "イヴ・ビソウマ",
  "Rodrigo Bentancur":     "ロドリゴ・ベンタンクール",
  "Brennan Johnson":       "ブレナン・ジョンソン",
  "Dominic Solanke":       "ドミニク・ソランケ",

  // ─── Wolverhampton Wanderers ───────────────────────
  "Matheus Cunha":         "マテウス・クーニャ",
  "Hwang Hee-chan":        "ファン・ヒチャン",
  "José Sá":               "ジョゼ・サー",
  "Nelson Semedo":         "ネルソン・セメド",
  "João Gomes":            "ジョアン・ゴメス",
  "Pablo Sarabia":         "パブロ・サラビア",
  "Rúben Neves":           "ルベン・ネヴェス",

  // ─── Brighton ──────────────────────────────────────
  "Evan Ferguson":         "エヴァン・ファーガソン",
  "Danny Welbeck":         "ダニー・ウェルベック",
  "João Pedro":            "ジョアン・ペドロ",
  "Simon Adingra":         "シモン・アディングラ",
  "Bart Verbruggen":       "バルト・フェルブルッヘン",
  "Pascal Groß":           "パスカル・グロース",
  "Kaoru Mitoma":          "三笘 薫",
  "Tariq Lamptey":         "タリク・ランプテイ",

  // ─── Brentford ─────────────────────────────────────
  "Ivan Toney":            "アイヴァン・トニー",
  "Bryan Mbeumo":          "ブライアン・ムビューモ",
  "Yoane Wissa":           "ヨアネ・ウィサ",
  "Mark Flekken":          "マーク・フレッケン",
  "Nathan Collins":        "ネイサン・コリンズ",
  "Christian Nørgaard":    "クリスチャン・ノーゴール",
  "Kristoffer Ajer":       "クリストッファー・エアー",

  // ─── Crystal Palace ────────────────────────────────
  "Eberechi Eze":          "エベレチ・エゼ",
  "Michael Olise":         "マイケル・オリーズ",
  "Jean-Philippe Mateta":  "ジャン＝フィリップ・マテタ",
  "Marc Guéhi":            "マルク・グエイ",
  "Joachim Andersen":      "ヨアヒム・アンデルセン",
  "Oliver Glasner":        "オリバー・グラスナー",

  // ─── West Ham United ───────────────────────────────
  "Jarrod Bowen":          "ジャロッド・ボーウェン",
  "Mohammed Kudus":        "モハメッド・クドゥス",
  "Lucas Paquetá":         "ルーカス・パケタ",
  "Alphonse Areola":       "アルフォンス・アレオラ",
  "Edson Álvarez":         "エドソン・アルバレス",
  "Vladimir Coufal":       "ウラジミール・コウファル",
  "Michail Antonio":       "ミカイル・アントニオ",

  // ─── Bournemouth ───────────────────────────────────
  "Antoine Semenyo":       "アントワーヌ・セメニョ",
  "Evanilson":             "エヴァニウソン",
  "Kieffer Moore":         "キーファー・ムーア",
  "Dango Ouattara":        "ダンゴ・ワタラ",
  "Philip Billing":        "フィリップ・ビリング",

  // ─── Nottingham Forest ─────────────────────────────
  "Taiwo Awoniyi":         "タイウォ・アウォニイ",
  "Chris Wood":            "クリス・ウッド",
  "Callum Hudson-Odoi":    "カラム・ハドソン＝オドイ",
  "Anthony Elanga":        "アンソニー・エランガ",
  "Nuno Espírito Santo":   "ヌーノ・エスピリト・サント",

  // ─── Leicester City ────────────────────────────────
  "Jamie Vardy":           "ジェイミー・ヴァーディ",
  "Stephy Mavididi":       "ステフィー・マヴィディディ",
  "Patson Daka":           "パトソン・ダカ",
  "James Justin":          "ジェームズ・ジャスティン",

  // ─── Southampton ───────────────────────────────────
  "Tyler Dibling":         "タイラー・ディブリング",
  "Cameron Archer":        "キャメロン・アーチャー",
  "Ross Barkley":          "ロス・バークレー",
  "Adam Armstrong":        "アダム・アームストロング",

  // ─── Ipswich Town ──────────────────────────────────
  "Omari Hutchinson":      "オマリ・ハッチンソン",
  "Liam Delap":            "リアム・デラップ",
  "Sammie Szmodics":       "サミー・スモディクス",
  "Christian Walton":      "クリスチャン・ウォルトン",

  // ─── 日本人選手（漢字表記） ───────────────────────────
  "Wataru Endo":           "遠藤 航",
  "Takehiro Tomiyasu":     "冨安 健洋",
  "Reo Hatate":            "旗手 怜央",
  "Daichi Kamada":         "鎌田 大地",
  "Hiroki Ito":            "伊藤 洋輝",
  "Yuki Kobayashi":        "小林 祐希",
};

export function getPlayerNameJa(englishName: string): string | null {
  return PLAYER_NAMES_JA[englishName] ?? null;
}

// Median annual wages by state, May 2025. Source: U.S. Bureau of Labor Statistics, OEWS.
// Official bulk text feed: https://download.bls.gov/pub/time.series/oe/oe.data.0.Current
// Area mapping: https://download.bls.gov/pub/time.series/oe/oe.area
// Unadjusted, cross-industry, datatype 13 (annual median), period A01.
// null = unavailable/suppressed or top-coded; never substituted with a mean or another year.
// Regenerate with scripts/import-state-pay.js; occupations: scripts/state-pay-occupations.json.
const STATE_PAY_YEAR = 2025;
const STATE_PAY_OCCS = [
  {
    "key": "all",
    "name": "All jobs",
    "emoji": "🇺🇸",
    "soc": "00-0000"
  },
  {
    "key": "rn",
    "name": "Registered nurse",
    "emoji": "🏥",
    "soc": "29-1141"
  },
  {
    "key": "swdev",
    "name": "Software developer",
    "emoji": "💻",
    "soc": "15-1252"
  },
  {
    "key": "elec",
    "name": "Electrician",
    "emoji": "💡",
    "soc": "47-2111"
  },
  {
    "key": "acct",
    "name": "Accountant & auditor",
    "emoji": "🧾",
    "soc": "13-2011"
  },
  {
    "key": "hyg",
    "name": "Dental hygienist",
    "emoji": "🪥",
    "soc": "29-1292"
  },
  {
    "key": "plumber",
    "name": "Plumber, pipefitter & steamfitter",
    "emoji": "🔧",
    "soc": "47-2152"
  },
  {
    "key": "hvac",
    "name": "HVAC mechanic & installer",
    "emoji": "❄️",
    "soc": "49-9021"
  },
  {
    "key": "carpenter",
    "name": "Carpenter",
    "emoji": "🪚",
    "soc": "47-2031"
  },
  {
    "key": "auto",
    "name": "Automotive service technician & mechanic",
    "emoji": "🚗",
    "soc": "49-3023"
  },
  {
    "key": "truck",
    "name": "Heavy & tractor-trailer truck driver",
    "emoji": "🚚",
    "soc": "53-3032"
  },
  {
    "key": "elementary",
    "name": "Elementary school teacher (except special education)",
    "emoji": "📚",
    "soc": "25-2021"
  },
  {
    "key": "secondary",
    "name": "Secondary school teacher (except special/career education)",
    "emoji": "🏫",
    "soc": "25-2031"
  },
  {
    "key": "pt",
    "name": "Physical therapist",
    "emoji": "🩺",
    "soc": "29-1123"
  },
  {
    "key": "medassist",
    "name": "Medical assistant",
    "emoji": "🩹",
    "soc": "31-9092"
  },
  {
    "key": "police",
    "name": "Police & sheriff's patrol officer",
    "emoji": "🚓",
    "soc": "33-3051"
  },
  {
    "key": "infosec",
    "name": "Information security analyst",
    "emoji": "🔐",
    "soc": "15-1212"
  },
  {
    "key": "civil",
    "name": "Civil engineer",
    "emoji": "🌉",
    "soc": "17-2051"
  }
];
const STATE_PAY = {
  "Alabama": {"all":45670,"rn":77080,"swdev":122540,"elec":55690,"acct":74880,"hyg":61160,"plumber":58670,"hvac":48370,"carpenter":48220,"auto":45640,"truck":52120,"elementary":61380,"secondary":61990,"pt":97290,"medassist":36100,"police":51270,"infosec":122730,"civil":99010},
  "Alaska": {"all":61000,"rn":109480,"swdev":null,"elec":89440,"acct":83460,"hyg":132690,"plumber":93920,"hvac":77430,"carpenter":73860,"auto":60840,"truck":70100,"elementary":79260,"secondary":79650,"pt":115280,"medassist":52560,"police":99130,"infosec":114990,"civil":114730},
  "Arizona": {"all":50060,"rn":99500,"swdev":129690,"elec":61060,"acct":79970,"hyg":101010,"plumber":62070,"hvac":59400,"carpenter":58580,"auto":49570,"truck":58080,"elementary":56590,"secondary":58360,"pt":103220,"medassist":45940,"police":78880,"infosec":125260,"civil":89660},
  "Arkansas": {"all":43630,"rn":78940,"swdev":104490,"elec":49070,"acct":66330,"hyg":86760,"plumber":48660,"hvac":48110,"carpenter":47760,"auto":44160,"truck":51550,"elementary":52700,"secondary":59660,"pt":99010,"medassist":37760,"police":47670,"infosec":103490,"civil":85020},
  "California": {"all":58240,"rn":140270,"swdev":174410,"elec":76160,"acct":97050,"hyg":124930,"plumber":72830,"hvac":72560,"carpenter":75920,"auto":64980,"truck":60230,"elementary":99650,"secondary":101370,"pt":124190,"medassist":49660,"police":118880,"infosec":138570,"civil":122500},
  "Colorado": {"all":59800,"rn":100260,"swdev":138390,"elec":62230,"acct":97030,"hyg":109580,"plumber":63240,"hvac":65200,"carpenter":62830,"auto":61280,"truck":61500,"elementary":63410,"secondary":72900,"pt":102030,"medassist":48400,"police":97350,"infosec":135220,"civil":101420},
  "Connecticut": {"all":59690,"rn":102740,"swdev":134120,"elec":77540,"acct":97550,"hyg":100690,"plumber":77280,"hvac":76610,"carpenter":64060,"auto":60220,"truck":60490,"elementary":80600,"secondary":80970,"pt":104360,"medassist":47430,"police":82170,"infosec":130570,"civil":103150},
  "Delaware": {"all":52190,"rn":99520,"swdev":133020,"elec":63700,"acct":95020,"hyg":98910,"plumber":64720,"hvac":62320,"carpenter":59200,"auto":58410,"truck":57590,"elementary":75920,"secondary":77960,"pt":102050,"medassist":44490,"police":92970,"infosec":137030,"civil":100220},
  "District of Columbia": {"all":91540,"rn":102540,"swdev":136880,"elec":78970,"acct":111530,"hyg":137220,"plumber":101020,"hvac":84390,"carpenter":61710,"auto":68660,"truck":64170,"elementary":96580,"secondary":82750,"pt":101640,"medassist":51050,"police":88650,"infosec":135090,"civil":103880},
  "Florida": {"all":47880,"rn":84190,"swdev":130980,"elec":57250,"acct":79250,"hyg":91980,"plumber":52910,"hvac":56670,"carpenter":49870,"auto":48260,"truck":50640,"elementary":58930,"secondary":60410,"pt":101040,"medassist":43680,"police":74470,"infosec":124860,"civil":98570},
  "Georgia": {"all":48170,"rn":93550,"swdev":131010,"elec":58320,"acct":81900,"hyg":95490,"plumber":57200,"hvac":56390,"carpenter":49350,"auto":49060,"truck":57050,"elementary":72290,"secondary":75480,"pt":102700,"medassist":41600,"police":58120,"infosec":128970,"civil":84240},
  "Hawaii": {"all":56320,"rn":136320,"swdev":124040,"elec":96460,"acct":74500,"hyg":97570,"plumber":78060,"hvac":65450,"carpenter":85280,"auto":52160,"truck":59820,"elementary":71410,"secondary":74310,"pt":101700,"medassist":48410,"police":83820,"infosec":126250,"civil":94280},
  "Idaho": {"all":47970,"rn":92460,"swdev":131590,"elec":63000,"acct":74730,"hyg":94650,"plumber":52380,"hvac":56240,"carpenter":52000,"auto":48420,"truck":58770,"elementary":61600,"secondary":61690,"pt":99000,"medassist":44700,"police":66990,"infosec":null,"civil":98030},
  "Illinois": {"all":51960,"rn":95990,"swdev":132110,"elec":99560,"acct":80230,"hyg":96670,"plumber":99950,"hvac":77410,"carpenter":79000,"auto":49170,"truck":60320,"elementary":75320,"secondary":79990,"pt":105250,"medassist":46090,"police":100520,"infosec":124180,"civil":99760},
  "Indiana": {"all":47860,"rn":83500,"swdev":105920,"elec":68490,"acct":77720,"hyg":92330,"plumber":76320,"hvac":60430,"carpenter":62870,"auto":49360,"truck":60290,"elementary":59700,"secondary":61880,"pt":101560,"medassist":45110,"police":73370,"infosec":101420,"civil":98270},
  "Iowa": {"all":48540,"rn":78630,"swdev":114890,"elec":60860,"acct":77440,"hyg":84010,"plumber":63890,"hvac":60680,"carpenter":57710,"auto":50510,"truck":58070,"elementary":60580,"secondary":61200,"pt":97560,"medassist":45480,"police":74470,"infosec":119710,"civil":96430},
  "Kansas": {"all":48010,"rn":79320,"swdev":113420,"elec":65860,"acct":79000,"hyg":null,"plumber":65220,"hvac":60460,"carpenter":56960,"auto":47790,"truck":58920,"elementary":56450,"secondary":59920,"pt":98290,"medassist":39510,"police":59230,"infosec":100620,"civil":96880},
  "Kentucky": {"all":46920,"rn":81040,"swdev":109010,"elec":59720,"acct":75270,"hyg":78830,"plumber":64160,"hvac":58620,"carpenter":52680,"auto":44890,"truck":56340,"elementary":60610,"secondary":61560,"pt":100710,"medassist":39270,"police":60490,"infosec":103630,"civil":100930},
  "Louisiana": {"all":45520,"rn":80230,"swdev":102800,"elec":61540,"acct":73810,"hyg":85240,"plumber":63680,"hvac":58650,"carpenter":49920,"auto":46400,"truck":49320,"elementary":58770,"secondary":59850,"pt":98530,"medassist":36320,"police":48380,"infosec":92990,"civil":105380},
  "Maine": {"all":51430,"rn":86990,"swdev":123120,"elec":75380,"acct":77480,"hyg":97680,"plumber":64000,"hvac":63170,"carpenter":62160,"auto":52040,"truck":57050,"elementary":62390,"secondary":64880,"pt":99720,"medassist":47580,"police":67050,"infosec":101730,"civil":97820},
  "Maryland": {"all":59510,"rn":99790,"swdev":138680,"elec":73490,"acct":89370,"hyg":107830,"plumber":65400,"hvac":70020,"carpenter":62960,"auto":57520,"truck":59360,"elementary":77680,"secondary":78670,"pt":106890,"medassist":46410,"police":77970,"infosec":139640,"civil":100680},
  "Massachusetts": {"all":63590,"rn":104550,"swdev":165210,"elec":79420,"acct":99460,"hyg":100640,"plumber":93880,"hvac":77300,"carpenter":75200,"auto":60760,"truck":63030,"elementary":94000,"secondary":95260,"pt":103790,"medassist":49460,"police":78940,"infosec":136550,"civil":106730},
  "Michigan": {"all":49270,"rn":94300,"swdev":125570,"elec":76270,"acct":78820,"hyg":83790,"plumber":80190,"hvac":60850,"carpenter":61680,"auto":54120,"truck":57180,"elementary":65110,"secondary":66030,"pt":100900,"medassist":39870,"police":73730,"infosec":106230,"civil":92100},
  "Minnesota": {"all":56920,"rn":101510,"swdev":130050,"elec":78160,"acct":81600,"hyg":103970,"plumber":94410,"hvac":76350,"carpenter":64930,"auto":58390,"truck":61990,"elementary":76350,"secondary":76460,"pt":102010,"medassist":50480,"police":83360,"infosec":130710,"civil":101480},
  "Mississippi": {"all":40120,"rn":77090,"swdev":95330,"elec":60860,"acct":68100,"hyg":67280,"plumber":55480,"hvac":48680,"carpenter":48650,"auto":37820,"truck":51820,"elementary":49790,"secondary":50980,"pt":99990,"medassist":35360,"police":46140,"infosec":87690,"civil":100170},
  "Missouri": {"all":47800,"rn":81780,"swdev":126120,"elec":65410,"acct":76590,"hyg":92750,"plumber":66790,"hvac":59950,"carpenter":60840,"auto":49160,"truck":54550,"elementary":50910,"secondary":59240,"pt":99310,"medassist":40440,"police":59460,"infosec":103440,"civil":92750},
  "Montana": {"all":48740,"rn":85280,"swdev":121990,"elec":76760,"acct":75810,"hyg":98440,"plumber":79960,"hvac":60850,"carpenter":58820,"auto":58740,"truck":58870,"elementary":57530,"secondary":60990,"pt":91450,"medassist":46820,"police":70050,"infosec":81950,"civil":93070},
  "Nebraska": {"all":48980,"rn":84730,"swdev":110900,"elec":60820,"acct":72080,"hyg":92580,"plumber":60970,"hvac":59850,"carpenter":50320,"auto":50560,"truck":58390,"elementary":62380,"secondary":63450,"pt":97090,"medassist":47370,"police":74620,"infosec":92550,"civil":103150},
  "Nevada": {"all":47660,"rn":103670,"swdev":128810,"elec":73570,"acct":81600,"hyg":115290,"plumber":61610,"hvac":60510,"carpenter":62380,"auto":48290,"truck":62290,"elementary":65040,"secondary":65520,"pt":111250,"medassist":45200,"police":78140,"infosec":106200,"civil":104310},
  "New Hampshire": {"all":55880,"rn":99700,"swdev":139720,"elec":62840,"acct":83470,"hyg":101250,"plumber":66810,"hvac":73850,"carpenter":61200,"auto":59020,"truck":60280,"elementary":72410,"secondary":77060,"pt":99850,"medassist":48020,"police":71640,"infosec":124000,"civil":98710},
  "New Jersey": {"all":58570,"rn":106500,"swdev":135940,"elec":77250,"acct":100830,"hyg":107040,"plumber":78240,"hvac":74450,"carpenter":64010,"auto":56610,"truck":63570,"elementary":78200,"secondary":82200,"pt":112140,"medassist":47210,"police":92610,"infosec":134820,"civil":104660},
  "New Mexico": {"all":47210,"rn":94340,"swdev":124520,"elec":58390,"acct":78580,"hyg":95940,"plumber":61440,"hvac":50270,"carpenter":59720,"auto":47300,"truck":50500,"elementary":74550,"secondary":75900,"pt":106880,"medassist":39230,"police":69180,"infosec":130070,"civil":103900},
  "New York": {"all":59670,"rn":109440,"swdev":166180,"elec":78750,"acct":102640,"hyg":106130,"plumber":77490,"hvac":74430,"carpenter":72330,"auto":54120,"truck":62050,"elementary":85760,"secondary":97070,"pt":100660,"medassist":48000,"police":92790,"infosec":134660,"civil":103760},
  "North Carolina": {"all":47970,"rn":84350,"swdev":134710,"elec":56800,"acct":82050,"hyg":97850,"plumber":57080,"hvac":57260,"carpenter":49100,"auto":48200,"truck":51530,"elementary":54930,"secondary":57650,"pt":99910,"medassist":45140,"police":59300,"infosec":131540,"civil":100730},
  "North Dakota": {"all":52480,"rn":80730,"swdev":105600,"elec":65710,"acct":75730,"hyg":90530,"plumber":63560,"hvac":74490,"carpenter":57890,"auto":57360,"truck":60910,"elementary":60030,"secondary":61210,"pt":85330,"medassist":45980,"police":74500,"infosec":107540,"civil":98190},
  "Ohio": {"all":49380,"rn":82510,"swdev":114090,"elec":64700,"acct":79320,"hyg":88990,"plumber":63330,"hvac":62510,"carpenter":60810,"auto":48710,"truck":59800,"elementary":77370,"secondary":78800,"pt":103050,"medassist":42810,"police":77020,"infosec":110480,"civil":96220},
  "Oklahoma": {"all":45600,"rn":82920,"swdev":118100,"elec":61010,"acct":79370,"hyg":97580,"plumber":57970,"hvac":57560,"carpenter":46910,"auto":46560,"truck":54410,"elementary":48200,"secondary":48710,"pt":98590,"medassist":38750,"police":59700,"infosec":94000,"civil":98760},
  "Oregon": {"all":57000,"rn":129010,"swdev":142720,"elec":101310,"acct":85800,"hyg":122080,"plumber":97050,"hvac":62940,"carpenter":62870,"auto":58520,"truck":61980,"elementary":77130,"secondary":79570,"pt":103510,"medassist":50410,"police":88140,"infosec":null,"civil":105250},
  "Pennsylvania": {"all":49690,"rn":96430,"swdev":126550,"elec":67600,"acct":79000,"hyg":80610,"plumber":68080,"hvac":62400,"carpenter":59370,"auto":49800,"truck":58580,"elementary":77060,"secondary":78800,"pt":101380,"medassist":43920,"police":85470,"infosec":117770,"civil":97850},
  "Rhode Island": {"all":56780,"rn":100640,"swdev":130590,"elec":74090,"acct":95820,"hyg":86910,"plumber":76470,"hvac":67370,"carpenter":60840,"auto":51770,"truck":60190,"elementary":90930,"secondary":92610,"pt":99400,"medassist":47190,"police":77230,"infosec":109420,"civil":99300},
  "South Carolina": {"all":46490,"rn":82360,"swdev":129450,"elec":58740,"acct":76560,"hyg":84340,"plumber":53940,"hvac":56610,"carpenter":50670,"auto":48100,"truck":51130,"elementary":60820,"secondary":62580,"pt":101330,"medassist":41160,"police":58070,"infosec":105800,"civil":101600},
  "South Dakota": {"all":47080,"rn":78060,"swdev":96310,"elec":61390,"acct":78880,"hyg":92210,"plumber":51620,"hvac":61390,"carpenter":48140,"auto":51160,"truck":58690,"elementary":50130,"secondary":51050,"pt":92660,"medassist":41870,"police":60740,"infosec":116640,"civil":98700},
  "Tennessee": {"all":47380,"rn":81500,"swdev":122430,"elec":61090,"acct":76840,"hyg":84640,"plumber":58600,"hvac":55490,"carpenter":50830,"auto":50290,"truck":58620,"elementary":59980,"secondary":61860,"pt":100140,"medassist":39570,"police":59280,"infosec":115430,"civil":95910},
  "Texas": {"all":48620,"rn":95970,"swdev":132150,"elec":58570,"acct":80920,"hyg":99240,"plumber":59840,"hvac":57760,"carpenter":48900,"auto":48310,"truck":56290,"elementary":62760,"secondary":63590,"pt":105810,"medassist":39520,"police":75900,"infosec":129890,"civil":96860},
  "Utah": {"all":50110,"rn":84600,"swdev":128810,"elec":62000,"acct":79990,"hyg":91120,"plumber":61900,"hvac":58730,"carpenter":52360,"auto":46570,"truck":60620,"elementary":74810,"secondary":76330,"pt":99880,"medassist":45360,"police":77310,"infosec":99690,"civil":96830},
  "Vermont": {"all":56390,"rn":97460,"swdev":125280,"elec":63430,"acct":78890,"hyg":97470,"plumber":62170,"hvac":62150,"carpenter":62400,"auto":51630,"truck":60830,"elementary":63070,"secondary":76220,"pt":97970,"medassist":47250,"police":68910,"infosec":109750,"civil":95600},
  "Virginia": {"all":55690,"rn":93600,"swdev":136460,"elec":62900,"acct":93290,"hyg":102950,"plumber":60470,"hvac":59730,"carpenter":55690,"auto":59330,"truck":56860,"elementary":65550,"secondary":72170,"pt":101450,"medassist":44740,"police":65870,"infosec":134900,"civil":97120},
  "Washington": {"all":62990,"rn":124200,"swdev":166540,"elec":95220,"acct":96550,"hyg":131160,"plumber":81030,"hvac":75660,"carpenter":74190,"auto":57270,"truck":64760,"elementary":102350,"secondary":102670,"pt":105950,"medassist":59290,"police":102080,"infosec":154940,"civil":110000},
  "West Virginia": {"all":45300,"rn":80130,"swdev":121000,"elec":64810,"acct":73320,"hyg":73840,"plumber":56980,"hvac":48850,"carpenter":48710,"auto":37660,"truck":49480,"elementary":55630,"secondary":56610,"pt":96600,"medassist":37180,"police":56960,"infosec":null,"civil":86930},
  "Wisconsin": {"all":50270,"rn":95530,"swdev":122660,"elec":76540,"acct":79400,"hyg":96540,"plumber":81210,"hvac":61710,"carpenter":61660,"auto":54350,"truck":58610,"elementary":61210,"secondary":62870,"pt":101840,"medassist":48680,"police":78090,"infosec":101550,"civil":94600},
  "Wyoming": {"all":50270,"rn":83760,"swdev":115170,"elec":76120,"acct":77620,"hyg":85130,"plumber":62410,"hvac":54700,"carpenter":56850,"auto":51330,"truck":60310,"elementary":61150,"secondary":62690,"pt":100400,"medassist":40920,"police":66140,"infosec":98710,"civil":90590}
};
const STATE_PAY_NATIONAL = {
  "all": 50980,
  "acct": 83680,
  "infosec": 129180,
  "swdev": 135980,
  "civil": 100840,
  "elementary": 63970,
  "secondary": 72040,
  "pt": 102760,
  "rn": 97550,
  "hyg": 98100,
  "medassist": 45690,
  "police": 76210,
  "carpenter": 60580,
  "elec": 63190,
  "plumber": 63800,
  "auto": 50620,
  "hvac": 61010,
  "truck": 58640
};

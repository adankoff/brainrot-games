/**
 * MEME BOGGLE -- Boggle Logic
 * Grid generation, adjacency, path validation, word dictionary, scoring.
 */

// Letter frequency weights (roughly English distribution)
const LETTER_WEIGHTS = {
  A: 8, B: 2, C: 3, D: 4, E: 12, F: 2, G: 3, H: 2,
  I: 8, J: 1, K: 1, L: 4, M: 3, N: 6, O: 7, P: 3,
  Q: 1, R: 6, S: 6, T: 9, U: 4, V: 1, W: 2, X: 1,
  Y: 2, Z: 1,
};

/** Weighted letter pool for random selection */
const LETTER_POOL = [];
for (const [letter, weight] of Object.entries(LETTER_WEIGHTS)) {
  for (let i = 0; i < weight; i++) {
    LETTER_POOL.push(letter);
  }
}

/**
 * Generate a random 4x4 letter grid.
 * @returns {string[][]} 4x4 array of uppercase letters
 */
export function generateGrid() {
  const grid = [];
  for (let r = 0; r < 4; r++) {
    const row = [];
    for (let c = 0; c < 4; c++) {
      row.push(LETTER_POOL[Math.floor(Math.random() * LETTER_POOL.length)]);
    }
    grid.push(row);
  }
  return grid;
}

/**
 * Check if two grid cells are adjacent (including diagonals).
 * @param {number} r1
 * @param {number} c1
 * @param {number} r2
 * @param {number} c2
 * @returns {boolean}
 */
export function isAdjacent(r1, c1, r2, c2) {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return dr <= 1 && dc <= 1 && (dr + dc > 0);
}

/**
 * Validate a path: connected, no repeats.
 * @param {Array<{row: number, col: number}>} path
 * @returns {boolean}
 */
export function isValidPath(path) {
  if (path.length < 3) return false;
  const seen = new Set();
  for (let i = 0; i < path.length; i++) {
    const key = `${path[i].row},${path[i].col}`;
    if (seen.has(key)) return false;
    seen.add(key);
    if (i > 0 && !isAdjacent(path[i - 1].row, path[i - 1].col, path[i].row, path[i].col)) {
      return false;
    }
  }
  return true;
}

/**
 * Extract the word from a path on the grid.
 * @param {string[][]} grid
 * @param {Array<{row: number, col: number}>} path
 * @returns {string}
 */
export function getWordFromPath(grid, path) {
  return path.map(p => grid[p.row][p.col]).join('');
}

/**
 * Standard Boggle scoring.
 * @param {string} word
 * @returns {number}
 */
export function scoreWord(word) {
  const len = word.length;
  if (len <= 4) return 1;
  if (len === 5) return 2;
  if (len === 6) return 3;
  return 5; // 7+
}

// ---- Dictionary ----
// 2000+ common English 3-7 letter words
const DICTIONARY_RAW = `
ace act add age ago aid aim air all and ant any ape arc are ark arm art ash ask ate awe axe
bad bag ban bar bat bay bed bet bid big bin bit bog bow box boy bud bug bun bus but buy cab
can cap car cat cop cow cry cub cup cut dad dam day den dew did die dig dim dip dog dot dry
dub dud due dug dun duo dye ear eat eel egg ego elm emu end era eve ewe eye fab fad fan far
fat fax fed fee few fig fin fit fix fly foe fog for fox fry fun fur gag gal gap gas gay gem
get gin god got gum gun gut guy gym had ham has hat hay hem hen her hew hid him hip his hit
hog hop hot how hub hue hug hum hut ice icy ill imp ink inn ion ire its ivy jab jag jam jar
jaw jay jet jig job jog jot joy jug jut keg ken key kid kin kit lab lad lag lap law lay led
leg let lid lie lip lit log lot low lug mad man map mar mat maw max may men met mid mix mob
mop mow mud mug mum nag nap nay net new nil nip nod nor not now nun nut oak oar oat odd ode
off oft oil old one opt orb ore our out ova owe owl own pad pal pan pat paw pay pea peg pen
per pet pew pie pig pin pit ply pod pop pot pow pox pro pry pub pug pun pup pus put rag ram
ran rap rat raw ray red ref rib rid rig rim rip rob rod rot row rub rug rum run rut rye sac
sad sag sap sat saw say sea set sew she shy sin sip sir sit six ski sky sly sob sod son sop
sot sow soy spa spy sty sub sue sum sun sup tab tad tag tan tap tar tat tax tea ten the tie
tin tip toe ton too top tot tow toy try tub tug tun two urn use van vat vet vex via vie vow
wad wag war was wax way web wed wet who wig win wit woe wok won woo wow yak yam yap yaw yea
yen yes yet yew you zap zeal zen zing zip zone zoo
able acre aged aide airy ajar akin ally also amid arch area army atop auto avid away axle
back bade bake bald bale ball band bane bang bank bare bark barn base bath bead beam bean
bear beat been beer bell belt bend best bias bile bill bind bird bite blew blow blue blur
boar boat body bold bolt bomb bond bone book boom boot bore born boss both bowl brag bran
bred brew brim brow bulk bull bump bunk burn bury bush busy cage cake calf call calm came
camp cane cape card care cart case cash cast cave char chef chin chip chop cite city clad
clam clan clap claw clay clip clod clog clot club clue coal coat code coil coin cold colt
comb come cone cook cool cope copy cord core cork corn cost cozy crab crew crop crow cube
cult curb cure curl cute damp dare dark darn dart dash data date dawn dead deaf deal dear
deck deed deem deep deer deny desk dice diet dine dire dirt dish dock does dome done doom
door dose dove down doze drab drag draw drew drip drop drum dual dude duel duke dull dumb
dump dune dung dunk dusk dust duty each earl earn ease east easy edge edgy edit emit envy
epic even ever evil exam exit face fact fade fail fair fake fall fame fang fare farm fast
fate fawn fear feat feed feel feet fell felt fend fern file fill film find fine fire firm
fish fist five flag flak flan flap flat flaw flea fled flee flew flip flit flock flog flow
flue foam foil fold folk fond food fool foot ford fore fork form fort foul four free frog
from fuel full fume fund fury fuse gait gale gall game gape garb gash gasp gate gave gaze
gear gene gift gild gill gilt give glad glee glen glow glue glum gnaw goad goat goes gold
golf gone good gore gory gown grab gram gray grew grid grim grin grip grit grow grub gulf
gust guts hack hail hair hale half hall halt hand hang hard hare harm harp hate haul have
hawk haze hazy head heal heap hear heat heed heel held helm help herb herd here hero hide
high hike hill hilt hind hint hire hiss hive hoax hold hole holy home hone hood hook hope
horn hose host hour howl huge hull hump hung hunt hurl hymn iron isle itch item jack jade
jail jeer jerk jest jolt jump jury just keen keep kent kick kids kill kind king kiss kite
knee knew knit knob knot know lace lack laid lake lamb lame lamp land lane lark lash lass
last late lawn lead leaf leak lean leap left lend lens less lick lied life lift like limb
lime limp line link lion lips list live load loaf loan lock lodge loft logo lone long look
loop lord lore lose loss lost loud love luck lump lung lure lurk lust made mail main make
male mall malt mane many mare mark mash mask mass mast mate math maze mead meal mean meat
meek meet meld melt memo mend menu mere mesh mess mild mile milk mill mime mind mine mint
miss mist moan moat mock mode mold mole monk mood moon moor more morn moss most moth move
much muck mule mull muse must mute myth nail name nape navy near neat neck need nine node
none noon norm nose note noun nude numb oath obey odds odor once only onto open oral orca
ours oust oval oven over pace pack page paid pail pain pair pale palm pane park part pass
past path pave pawn peak peal pear peat peel peer pelt perk pest pick pier pile pine pink
pipe plan play plea plod plot plow ploy plug plum plus poke pole poll polo pomp pond pony
pool poor pope pork port pose posh post pour pray prey prop prose prow pull pulp pump punk
pure push quit race rack raft rage raid rail rain rake ramp rang rank rare rash rate rave
rays read real reap rear reed reef reel rein rely rent rest rice rich ride rift ring riot
rise risk road roam roar robe rock rode role roll roof room root rope rose rosy rout rove
ruby ruin rule rung rush rust safe sage said sail sake sale salt same sand sane sang sank
sash save scam scan scar seal seam seat seed seek seem seen self sell semi send sent sept
sew sewn shed shin ship shoe shoo shop shot show shut sick side sift sigh sign silk sill
silt sine sing sink sip sire site size skip slab slag slam slap slat slaw sled slew slid
slim slit slob slop slot slow slug slum smog snap snag snip snob snow snub snug soak soap
soar sock soda sofa soft soil sold sole some song soon sore sort soul sour span spar spec
sped spin spit spot spry stab stag star stay stem step stew stir stop stow stub stud stun
such suck suit sulk sung sunk sure surf swan swap sway swim swirl swore sync tack tail take
tale talk tall tame tank tape tare task taxi teak teal team tear tech tell tend tent term
test text than that them then they thin this thus tick tide tidy tier tile till tilt time
tine tiny tire toad toil told toll tomb tone took tool tore torn tour town trap tray tree
trek trim trio trip trod trot true tube tuck tuft tune turn tusk twin type ugly undo unit
unto upon urge used user vain vale vane vary vase vast veil vein vent verb very vest vial
vice view vine visa void volt vote wade wage wail wait wake walk wall wand want ward warm
warn warp wary wash wasp wave wavy waxy weak wean wear weed week weep weld well went were
west what when whim whip whom wick wide wife wild will wilt wily wind wine wing wink wipe
wire wise wish wisp with woke wolf womb wood wool word wore work worm worn wove wrap wren
writ yard yarn year yell zero zest
above abuse adapt added admit adopt adult after again agent agree ahead alarm album alert
alien align alike alive alley allot allow alone along alter angel anger angle angry apart
apple apply arena arise armor array arrow aside asset atlas avoid await awake award aware
awful badge badly basis batch beach begun being below bench blame bland blank blast blaze
bleed blend bless blind block blood bloom blown board boast bonus booth bound brain brand
brave bread break breed brick bride brief bring broad broke brook broth brown brush build
built bunch burst buyer cabin cable calm canal carry catch cause chain chair chant chaos
charm chart chase cheap check cheek cheer chess chest chief child chill choir chunk churn
claim clash class clean clear clerk click cliff climb cling clock clone close cloth cloud
coach coast color comet comic coral could count court cover crack craft crane crash crazy
cream creep crest crime crisp cross crowd crown crush curve cycle daily dance death debug
decay decoy delay dense depot depth devil diary dirty ditch dizzy dodge doubt dough draft
drain drama drank drape drawn dream dress dried drift drill drink drive drone drown drunk
dryer dying eager eagle early earth eater edge eight elder elect elite ember empty enemy
enjoy enter equal error essay evade event every exact exile exist extra fable fabric faint
faith false fancy fault feast fiber field fifth fifty fight final finer first fixed flame
flash flask fleet flesh flint float flock flood floor flora flour flown fluid flush flute
focal focus force forge forth found frame frank fraud fresh front frost froze fruit fully
funds funny giant given glade glare glass gleam glide globe gloom glory gloss glove grace
grade grain grand grant grape grasp grass grave great greed green greet grief grill grind
groan groom gross group grove grown guard guess guest guide guild guilt guise habit handy
happy harsh haste hasty hatch haunt haven heart heavy hedge hence herbs hinge hobby honey
honor horse hotel hound house hover human humor hurry hyper ideal image imply inbox index
indie infer inner input inter irate ivory jewel joint joker jolly judge juice juicy jumbo
karma kayak kitty knack kneel knife knock label labor laser latch laugh layer leach learn
lease least legal lemon level lever light limit linen liver local lodge logic loose lower
loyal lucky lunch lunge lyric magic major maker manor maple march marry match mayor media
mercy merge merit metal minor minus model money month moral motor mount mourn mouse mouth
movie muddy music naive nerve never night noble noise north nurse ocean offer often olive
onion opera orbit order other outer owner oxide ozone paint panel panic paper party paste
patch pause peace peach pearl pedal penny perch phase phone photo piano piece pilot pinch
pitch pixel place plain plane plant plate plaza plead pleat plier pluck plumb plump plunge
point polar pound power press price pride prime print prior prize probe proof proud prove
psalm pulse punch pupil purse queen query quest quick quiet quilt quirk quite quota quote
radar radio raise rally ranch range rapid ratio reach react realm rebel refer reign relax
reply rider ridge rifle right rigid rinse risky rival river robin robot rocky rouge round
route royal rugby rumor rural salad scale scare scene scent scope score scout scrap serve
seven shade shaft shake shall shame shape share shark sharp shave sheet shelf shell shift
shine shirt shock shore short shout shove shown shrub shrug siege sight sigma skill skull
slate sleep slept slice slide slope smart smell smile smoke snake solar solid solve sorry
sound south space spare spark speak spear speed spend spent spice spike spine spoke spoon
sport spray squad stack staff stage stain stair stake stall stamp stand stare start state
steam steel steep steer stern stick stiff still stock stole stone stood stool store storm
story stove strap straw stray strip stuck stuff style sugar suite super surge swamp swarm
swear sweat sweet swept swift swing sword swore syrup table taste teach teeth thank theme
there thick thing think third thorn those three threw throw thumb tiger tight timer title
toast today token topic total touch tough tower toxic trace track trade trail train trait
trash travel treat trend trial tribe trick tried troop truck truly trump trunk trust truth
tumor tuner tweak twice twist ultra uncle under union unite unity until upper upset urban
usage usher usual utter valid value valve vapor vault verse video vigor viral virus visit
vital vivid vocal voice voter wagon waste watch water weary weave wedge weird wheat wheel
where which while whirl white whole whose width witch woman women world worry worse worst
worth would wound wrath wrist wrote yacht yield young youth
absorb accent accept access accord accuse across acting action active actual adjust admire
advent advice advise afford agency agenda allied almost amount animal annual answer anyone
anyway appeal appear arrive artist aspect assign assist assume assure attach attack attend
autumn battle beauty became become before behalf behave behind belong beside bestow beyond
bishop bitter blanch blouse bottom bounce branch breath bridge bright broken bronze bubble
budget bundle burden bureau butler button bypass camera cancel carbon career castle cattle
caught causal center chance change charge cheese choice choose church circle client closed
closet coarse colony colour column combat coming commit common compel convey cookie corner
costly cotton county couple course cousin create credit crisis crowd custom damage danger
deadly dealer debate debris decade decent decide deeply defeat defend define degree demand
depart depend deploy deputy derive desert design desire detail detect device devote dialog
differ dinner direct divide divine domain donate double dragon driven driver during earned
easily eating editor effect effort eighth eleven emerge empire employ enable ending endure
energy engage engine enough ensure entire equity escape ethnic evolve exceed except excess
excite excuse exempt exhibit expand expect expert export expose extend extent fabric facial
factor fairly fallen family famous farmer faster father favour female fierce figure filter
finale finger finish fiscal flower flying folder follow forced forest forever forget formal
former foster fourth freeze frozen future gained galaxy garden gather gender gentle gifted
global golden govern growth guilty guitar handle happen harbor hardly hazard health heaven
hereby hidden highly hollow honest honour horror humour hunger hunter hybrid ignore immune
impact import impose income indeed indoor induce infant inform injure injury inland insect
insert inside insist insure intake intend invest invite island itself jersey junior kernel
ladder lately launch lawyer layout leader league legend lender lesson letter likely linear
lineup liquid listen little lively locate longer looked lovely luxury maiden mainly manage
manner manual margin marine marker market mature medium member memoir mental mentor merely
merger method middle mighty minded mirror mobile modest module moment mostly mother motion
murder muscle museum mutual namely narrow nation native nature nearby nearly neatly needle
nicely ninety nobody normal notice notion number object obtain occupy offend office online
opener openly oppose option orange orient origin outfit outlaw output oxford oxygen packed
palace parade parent partly passed patent patrol patron peanut pencil people period permit
person phrase pickup pillar plague planet player please pledge plenty pocket poetry policy
polite poorly portal poster potent praise prayer prefer pretty prince prison profit prompt
proper proven public pursue puzzle racial racism random ranger rarely rating reader really
reason recall recent record reduce reform regard regime region reject relate relief remain
remedy remote remove render rental repair repeat report rescue resign resist resort result
retail retain retire return reveal review revolt reward rhythm robust roller ruling sacred
safely sailor salary sample saving scheme school script search season second secret sector
secure seeing select seller senior serial series server settle severe shadow shaped shelve
shield signal silver simple singer single sketch slight smooth snatch soccer solely sought
source sphere spirit spread spring square stable staged stance status steady stolen strain
strand stream street stress strict strike string stripe strive stroke strong struck subtle
sudden suffer summer summit summit summit supply surely survey switch symbol tablet tackle
talent target temple tender tenure terror thanks thirty though thread threat throne thrown
timber tissue toilet tongue toward travel treaty tribal tricky triple trophy tunnel twelve
unfair unfold unique unless unlike update uphold urgent vacuum valley vanish varied vendor
verbal verify versus vessel victim viewer virgin virtue vision visual volume wander warmth
wealth weapon weekly whisky wholly wicked widely window winter wisdom within wonder worker
worthy writer yellow zenith
abandon ability absence academy account achieve acquire address adequate advance adverse
affair against airport alcohol algebra alleged already amazing amidst analyst ancient
another anxiety anymore anytime applaud applied assault attempt attract auction average
barrier battery bearing because beneath benefit besides between billion bracket brother
cabinet calcium calorie capable capital cardiac carrier catalog ceiling central certain
chapter charity checked chicken circuit citizen claimed classic climate closely closest
cluster coastal coating cockpit collect college combine comfort command compact company
compare compete complex concern conduct confirm connect consent consist consist contact
contain content contest context control convert corrupt counter country coupled courage
crucial crystal cuisine culture current curtain damaged dealing decades decided declare
decline deep default defense deficit defined deliver density depart deposit derived deserve
desktop despite destroy devoted digital diploma disable disease dismiss display dispute
distant diverse divided drawing driving dynamic earlier eastern economy edition elderly
elegant element embrace emotion emperor endless engaged enhance episode equally erosion
essence eternal evening evident examine example excited exclude execute exhibit expense
explain exploit explore extreme fantasy fashion fiction finance fitness fixture foreign
formula fortune forward founder funding furnish gallery gateway general genetic gesture
glimpse graphic gravity grocery growing habitat halfway handler harmful harvest heading
healthy hearing helpful highway himself history holiday horizon hostile housing however
hundred illegal imagine implies improve impulse include inflict initial inquiry insight
inspect instead interim invalid involve isolate jointly journal justice justify keeping
kingdom kitchen lacking landing largely leading leather leaving lending liberal liberty
license limited loading logical longest loyalty manager meaning measure mention migrate
million mineral minimum miracle mission mixture monitor monthly morning mounted mystery
namely natural neglect neither neither network notable nothing nuclear nursing obvious
observe offense officer ongoing opinion organic outline outlook overlap oversee package
painful parking partial partner passage passion patient pattern payment penalty percent
perfect persist picture pioneer plastic pointed popular portion poverty predict premium
present prevent primary printer privacy private proceed process produce product profile
program project promise promote prosper protect protest provide publish purpose pushing
qualify quarter radical rapidly reality receive recover reflect refugee regular related
release remains removal replace require reserve resolve respect respond restore revenue
rolling routine scandal scatter scholar section seeking segment serious service session
setting shelter silence similar society somehow species sponsor storage strange student
subject success suggest support supreme surface surplus survive sustain thereby thought
tobacco tobacco tonight totally tourist trading trigger trouble turning typical uniform
unhappy unified vehicle venture version violent virtual welfare western willing written
`;

/** @type {Set<string>} */
const DICTIONARY = new Set();

// Parse dictionary: split on whitespace, filter valid 3-7 letter words
for (const word of DICTIONARY_RAW.split(/\s+/)) {
  const w = word.trim().toUpperCase();
  if (w.length >= 3 && w.length <= 7) {
    DICTIONARY.add(w);
  }
}

/**
 * Check if a word is in the dictionary.
 * @param {string} word - Uppercase word
 * @returns {boolean}
 */
export function isValidWord(word) {
  return DICTIONARY.has(word.toUpperCase());
}

/**
 * Find all valid words on a grid (for debugging / end-of-game display).
 * Uses DFS from each cell.
 * @param {string[][]} grid
 * @returns {Set<string>}
 */
export function findAllWords(grid) {
  const found = new Set();
  const rows = 4;
  const cols = 4;

  function dfs(r, c, path, visited) {
    const word = path.map(p => grid[p.row][p.col]).join('');
    if (word.length >= 3 && isValidWord(word)) {
      found.add(word);
    }
    if (word.length >= 7) return; // max word length

    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        const key = nr * 4 + nc;
        if (visited.has(key)) continue;
        visited.add(key);
        path.push({ row: nr, col: nc });
        dfs(nr, nc, path, visited);
        path.pop();
        visited.delete(key);
      }
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const visited = new Set([r * 4 + c]);
      dfs(r, c, [{ row: r, col: c }], visited);
    }
  }

  return found;
}

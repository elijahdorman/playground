import {h} from "../preact.js";

var CharacterSheetView = () => ()
/*
 * mobile first design
 * three screens to swipe between
 *
 * 1. dice roller with rules below
 * 2. character stats, bio, abilities, and complications
 * 3. character gear
 *
 * Always context menu in upper-right corner
 * for things like import/export
 *
 * always chat bubble at bottom?
 * rules text search
 * gear lookup
 * abiity lookup
 */

export default CharacterSheetView;

<body>
  <div class="row--top">
    <div class="column space-right">
      <div class="row--top">
        <!-- LEFT LEFT COLUMN -->
        <div class="column">
          <div class="section-title">
            Attributes
            <span class="note--medium">
              (step 1)
            </span>
          </div>
          <div class="section-content">
  Split 20 dice between your attributes. Body is how good you
  are with your hands and how healthy you are. Mind is your
  thinking skills and how hard you are to KO.
  Soul is your charisma, sanity, and willpower.
          </div>

          <div class="row">
            <div class="column-3--title"></div>
            <div class="column-3 attribute-label--small">Total</div>
            <div class="column-3 attribute-label--small">Current</div>
          </div>

          <div class="row">
            <div class="column-3--title attribute-label">Body</div>
            <div class="column-3"><input class="attribute-input" /></div>
            <div class="column-3"><input class="attribute-input" /></div>
          </div>

          <div class="row">
            <div class="column-3--title attribute-label">Mind</div>
            <div class="column-3"><input class="attribute-input" /></div>
            <div class="column-3"><input class="attribute-input" /></div>
          </div>

          <div class="row">
            <div class="column-3--title attribute-label">SouL</div>
            <div class="column-3"><input class="attribute-input" /></div>
            <div class="column-3"><input class="attribute-input" /></div>
          </div>

          <div class="row">
            <div class="column-3--title attribute-label">LucK</div>
            <div class="column-3"></div>
            <div class="column-3"><input class="attribute-input" /></div>
          </div>

          <div class="row attribute-label">Gear List</div>
          <input class="blank-line" />
          <input class="blank-line" />
          <input class="blank-line" />
          <input class="blank-line" />
          <input class="blank-line" />
          <input class="blank-line" />
          <input class="blank-line" />
          <input class="blank-line" />
        </div>
        <!-- RIGHT LEFT COLUMN -->
        <div class="column">

          <div class="page-title">PeaK Lite</div>

          <div class="section-title">
            Abilities and Complications
            <div class="note--medium">
              (step 2)
            </div>
          </div>
          <div class="section-content">
  You get 6 abilities (1 superb, 2 great, and 3 decent) and 2
  complications (things you are poor at). Your GM has final
  say on what is allowed.
            <br/>
            <br/>
  An ability is something your character excells at. It may be
  marksmanship, solving complex equations, charming acquaintances,
  someone who owes you an favor, using some kind of magic,
  an extra arm, or any number of other things. Complications
  are the reverse. They could be a missing limb, gross personal
  habits, an old enemy, paranoid delusions, etc. Each level (-4 to +6)
  adds/removes dice and prevents/causes loss of dice at one less than the level.
          </div>

          <div class="section-title">
            Gear
            <span class="note--medium">
              (step 3)
            </span>
          </div>

          <div class="section-content">
  Gear helps your character accomplish things. In the right circumstances,
  it may give a dice bonus, prevent the loss of some dice, give you
  another temporary attribute with its own dice, or maybe give you some
  other effect unrelated to dice at all. Work out with your GM which gear
  your character should have and what it does. If you run out of room for gear,
  write it on the back of the sheet.
          </div>
        </div>
      </div>

      <!-- LEFT LOWER COLUMN -->
      <div class="row">
        <div class="column">
          <div class="row attribute-label">
            Ability - Superb
            <span class="note--medium">
              &nbsp; (+3 dice, prevent the loss of 2 dice)
            </span>
          </div>
          <input class="blank-line" />

          <div class="row attribute-label">
            Ability - Great
            <span class="note--medium">
              &nbsp; (+2 dice, prevent the loss of 1 die)
            </span>
          </div>
          <input class="blank-line" />
          <input class="blank-line" />

          <div class="row attribute-label">
            Ability - Decent
            <span class="note--medium">
              &nbsp; (+1 die)
            </span>
          </div>
          <input class="blank-line" />
          <input class="blank-line" />
          <input class="blank-line" />

          <div class="row attribute-label">
            Complication - Inept
            <span class="note--medium">
              &nbsp; (-2 dice, lose 1 extra die)
            </span>
          </div>
          <input class="blank-line" />
          <input class="blank-line" />
        </div>
      </div>
    </div>



    <!-- RIGHT COLUMN -->
    <div class="column space-left">
      <div class="section-title">Get Challenged</div>
      <div class="section-content">
        As your story unfolds, you will encounter obstacles. The GM
  will describe the obstacle and you will describe a solution your
  character or team will take. The GM will set a difficulty (this
  may be secret, but usually will not be). If you get that many
  "hits", you succeed. For every 2 hits above the difficulty, you
  get an extra level of success and better things happen. For
  every 2 "hits" below the difficulty though, you get worse story
  complications.
      </div>

      <div class="section-title">Toss the Dice</div>
      <div class="section-content">
        The GM will let you know if what you're doing uses Body,
  Mind, or Soul and if any advantage or disadvantage exists.
  Decide how many dice to risk (at least one) and if you want to
  exert yourself before add any bonus dice from abilities, gear,
  and/or luck. When rolling, each 5 or 6 counts as a "hit". Doing
  things with a difficulty greater than zero requires physical,
  mental, or spiritual energy to to perform. Because of this, you
  lose any dice that roll a 1. If you're good at something or have
  the right equipment, this expenditure may be decreased, but if
  you are bad at something, it may increase instead.
      </div>

      <div class="section-title">Gain the Advantage</div>
      <div class="section-content">
  If your situation is better than normal, the GM may decide you have advantage.
  In this case, you "hit" on 4, 5, or 6. Conversly, they may decide your
  situation is worse than normal in which case only a 6 counts as a "hit".
      </div>

      <div class="section-title">Make Your Own Luck</div>
      <div class="section-content">
  If your roleplaying or ingenuity impress the GM, they may give you
  up to 3 luck dice. Use these to add to any roll (every 2 luck dice spent
  together prevent the loss of 1 die), but then they disappear (they also
  go away at the end of each session).
      </div>

      <div class="section-title">Exert Yourself</div>
      <div class="section-content">
  Sometimes, you need to risk it all to succeed. If you exert yourself, double
  the number of dice you risked, add any bonus dice from abilities, gear,
  and/or luck then add 3 more dice. Instead of losing dice on just a 1,
  you lose them on a 2 as well (these may be prevented like normal with abilities or gear).
      </div>

      <div class="section-title">Take the Offensive</div>
      <div class="section-content">
  When attacking, you don't get extra success. Instead, the target loses
  1 attribute die for each extra "hit" above the target difficulty.
  The attribute lost depends on the attack. A knife does damage to the body,
  but a hit to the head may damage both body and mind. A well-timed quip may
  damage the soul. When you are attacked, the GM gives you a difficulty that
  represents the incoming damage. If you are able and choose to block
  or avoid damage, each "hit" reduces damage by 1.
      </div>

      <div class="section-title">Help Your Friends</div>
      <div class="section-content">
  You may help another person, but at a cost. If they have advantage, you roll normal.
  If they roll normal, you roll disadvantage. If they have disadvantage, you do too.
      </div>

      <div class="section-title">Death and Complications</div>
      <div class="section-content">
  Sometimes, things get bad. You zigged instead of zagging or maybe the dice gods
  just hate you today. When you run out of dice for an attribute, things are
  probably going to get rough. Run out of Body or Mind dice and you are KO'd (knocked out).
  Run out of Soul dice and you are unresponsive. You can go negative on your
  current dice up to the same amount as your total dice. After that, the damage
  is irreparable (your body dies, your mind dies, or your soul dies).
  If you survive and the damage is repaired, you get one level of relevant
  complications per -3 dice.
      </div>
    </div>

  </div>
  <div class="license">
    PeaK Lite by Elijah Dorman and Tyler Goza is licensed under
    Creative Commons Attribution 4.0 International Public License
    https://creativecommons.org/licenses/by/4.0/legalcode
  </div>
  <style>
</body>

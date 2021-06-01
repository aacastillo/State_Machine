//Alan Castillo 
class FSA {
  constructor() {
    let state = undefined;
    let states = [];
    this.nextState = (e) => {                 //nextState(e: string): this
      if (state !== undefined) { //if current state is defined
        state = state.nextState(e);
      }
      return this;
    }

    function addTransitionsToState(transitions, createdState, stateNames){
      function addTransition2(transition) {
        let eventName = Object.keys(transition)[0];
        let stateValue = lib220.getProperty(transition, eventName).value; //this is a string
        stateNames = states.map(x => x.getName()); //updates stateNames
        //check whether state value exists
        if (stateNames.includes(stateValue)) {//state exists
          let aState = states.find(x => x.getName() === stateValue);
          createdState.addTransition(eventName, aState);
        } else { //stateValue doesn't exists
          let newState = new State(stateValue);
          states.push(newState);
          createdState.addTransition(eventName, newState); 
        }        
      }
      transitions.forEach(t => addTransition2(t));
    }

    this.createState = (s, transitions) => {  //createState(s: string, transitions: Transition[]): this
      let stateNames = states.map(x => x.getName());
      let createdState = new State(s);
      if (state === undefined) { //first created state
        states.push(createdState);
        addTransitionsToState(transitions, createdState, stateNames);
        state = createdState;
      } else if (!stateNames.includes(s)) { //state does not already exists
        states.push(createdState);
        addTransitionsToState(transitions, createdState, stateNames);
      } else { //state already exists
        addTransitionsToState(transitions, createdState, stateNames);
        if (state.getName() === s) { //if current state is old state, set it to adjusted state.
          state = createdState;
        }
        for(let i=0; i<states.length; ++i) {
          if (states[i].getName() === s) {
            states[i] = createdState;
          }
        }
      }
      return this;
    }
    this.addTransition = (s, t) => {         //addTransition(s: string, t: Transition): this
      let filteredStates = states.filter(x => x.getName() === s);
      if (filteredStates.length === 0) { //state name does not exist, create it.
        let transitArr = [t];
        this.createState(s,transitArr);
      } else { //state already exists
        let nextStateName = Object.values(t)[0]; 
        let filteredStates2  = states.filter(x => x.getName() === nextStateName);
        if (filteredStates2.length === 0) { //next state does not exist, create it
          let newState = new State(nextStateName);
          states.push(newState);
          states = states.map(x => (x.getName() === s)? x.addTransition(Object.keys(t)[0], newState) : x);
        } else { //next state already exists
          let oState = states.find(x => x.getName() === nextStateName);
          states = states.map(x => (x.getName() === s)? x.addTransition(Object.keys(t)[0], oState) : x);
        }
      }
      return this;
    }
    this.showState = () => {                 //showState(): string
      if (state === undefined) {
        return undefined;
      } else {
        return state.getName();
      }
    }
    this.createMemento = () => {            // createMemento(): Memento
      let m = new Memento();
      m.storeState(state);
      return m;
    }
    this.restoreMemento = (m) => {          // restoreMemento(m: Memento): this
      let mState = m.getState();
      if (states.includes(mState)) {
        state = mState;
      }
      return this;
    }
    class State {
      constructor(name) {                           //constructor(name: string): this
        let stateName = name;
        let transitions = [];
        this.getName = () => { return stateName;}  //getName(): string
        this.setName = (s) => {                     //setName(s: string): this
          stateName = s;
          return this;
        }
        this.addTransition = (e, s) => {            //addTransition(e: string, s: State): this
          let transition = {};
          lib220.setProperty(transition, e, s);
          
          transitions.push(transition);
          return this;
        }
        this.nextState = (e) => {                   //nextState(e: string): State
          let resultStates = this.nextStates(e);
          if (resultStates.length === 0) {
            return undefined;
          }
          let index = Math.floor(Math.random() * (resultStates.length - 0));
          let nextFoundState = resultStates[index];
          let FSAstate = states.find(x => x.getName() === nextFoundState.getName());
          return FSAstate;
        }
        this.nextStates = (e) => {                   //nextStates(e: string): State[] 
          let resultStates = [];
          function find(event, transition) {
            let curTransition = lib220.getProperty(transition, event);
            if (curTransition.found) {
              let nextState = curTransition.value;
              resultStates.push(nextState);
            }
          }
          transitions.forEach(t => find(e,t));
          return resultStates;
        }
      }
    }
    class Memento {
      constructor() {
        let state = undefined;
        this.getState = () => state;        //getState(): State
        this.storeState = (s) => state = s; //storeState(s: State): void
      }
    }
  }
}

test("1. first state undefined", function() {
  let myMachine = new FSA();
  assert (myMachine.showState() === undefined);
});

test("2. first built state is defined", function() {
  let myMachine = new FSA()
  .createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}]);
  assert(myMachine.showState() === "delicates, low");

  let myMachine2 = new FSA()
  .addTransition("test", {mode: "sanitize"}); //need to make sure the next state is created as well;
  assert(myMachine2.showState() === "test");
  assert(myMachine2.nextState("mode").showState() === "sanitize"); // checks that sanitize state was created as well
});

test('3. States overwritten in createState()', function() {
  let myMachine = new FSA()
  .createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}])
  .createState("delicates, low", [{mode: "sanitize"}])
  .createState("delicates, low", [{mode: "test"}]);
  assert(myMachine.nextState("mode").showState() === "test");
});
test('4. Circlular FSA', function(){
  let myMachine = new FSA()
  .createState("delicates, low", [{mode: "delicates, low"}])
  assert(myMachine.showState() === "delicates, low");
  assert(myMachine.nextState("mode").nextState("mode").showState() === "delicates, low");

  let myMachine2 = new FSA()
  .addTransition("sanitize", {mode: "sanitize"});
  assert(myMachine2.showState() === "sanitize");
  assert(myMachine2.nextState("mode").nextState("mode").nextState("mode").showState() === "sanitize");
});


test("5. fsa machine", function() {
  const myMachine = new FSA()
  .createState("delicates, low", [{mode: "normal, low"},{temp: "delicates, medium"}])
  .createState("normal, low", [{mode: "delicates, low"},{temp: "normal, medium"}])
  .createState("delicates, medium", [{mode: "normal, medium"},{temp: "delicates, low"}])
  .createState("normal, medium", [{mode: "delicates, medium"},{temp: "normal, high"}])
  .createState("normal, high", [{mode: "delicates, medium"},{temp:"normal, low"}]);

  assert(myMachine.showState() === "delicates, low");
  myMachine.nextState("temp");
  assert(myMachine.showState() === "delicates, medium");
  myMachine.nextState("mode");
  assert(myMachine.showState() === "normal, medium"); /failure - undefined/
  myMachine.nextState("temp");
  assert(myMachine.showState() === "normal, high");
});

test("6. Memento restores properly", function() {
  let myMachine = new FSA()
  .createState("delicates, low", [{mode: "normal, low"}, {temp: "delicates, medium"}])
  .createState("normal, low", [{mode: "delicates, low"}, {temp: "normal, medium"}])
  .createState("delicates, medium", [{mode: "normal, medium"}, {temp: "delicates, low"}])
  .createState("normal, medium", [{mode: "delicates, medium"}, {temp: "normal, high"}])
  .createState("normal, high", [{mode: "delicates, medium"},{temp: "normal, low"}]);

  myMachine.nextState("temp") // moves the machine to delicates, medium
  .nextState("mode") // moves the machine to normal, medium
  .nextState("temp"); // moves the machine to normal, high
  assert(myMachine.showState() === "normal, high");
  
  let restoreTo = myMachine.createMemento(); // creates memento from current state
  assert(restoreTo.getState().getName() === "normal, high"); // prints name of state in memento
  myMachine.nextState("mode") // moves the machine to delicates, medium
  .nextState("temp"); // moves the machine to delicates, low
  assert(myMachine.showState() === "delicates, low");
  myMachine.restoreMemento(restoreTo) // restores the machine to normal, high
  assert(myMachine.showState() === "normal, high");
});

test('7. createState and addTransition', function() {
  let machine = new FSA()
  .createState('A', [{ next: 'B' }])
  .addTransition('A', {skip: 'C'});
  machine.nextState("skip");
  assert(machine.showState() === "C");
});

test('8. Memento is stored as reference', function() {
  let machine = new FSA()
  .createState('A', [{next: 'B'}]);
  let m = machine.createMemento(); 
  machine.addTransition('A', {skip: 'C'});
  machine.restoreMemento(m)
  .nextState('skip'); 
  assert(machine.showState() === "C");
});

test('8. FSA maintains behavior w/ state name changes and addTransitions()', function() {
  let machine = new FSA()
  .createState('A', [{next: 'B'}])
  .createState("B", [{back: "A"}]);

  let m = machine.createMemento();
  m.getState().setName("test");
  machine.restoreMemento(m)
  .nextState("next");
  assert(machine.showState() === "B");
  machine.nextState("back");
  assert(machine.showState() === "test");
  machine.addTransition("A", {skip: "C"})
  .nextState("skip");
  assert(machine.showState() === undefined);
});

test('9. States picked non-deterministically', function() {
  let t1 = false;
  let t2 = false;
  for (let i=0; i<10; ++i) {
    let mach = new FSA()
    .createState("test", [{e: "test1"}, {e: "test2"}]);
    mach.nextState("e");
    if (mach.showState() === "test1") {
      t1 = true;
    } else if (mach.showState() === "test2") {
      t2 = true;
    }
  }
  assert(t1 && t2);
});

test('Momento restore properly when referenced state doesnt exist', function() {
  let blueFSA = new FSA()
  .createState("A", [{next: "B"}])

  let redFSA = new FSA()
  .createState("A", [{next: "test"}])

  let m = blueFSA.createMemento();
  redFSA.nextState("next"); //"test" State
  redFSA.restoreMemento(m);
  assert(redFSA.showState() === "test"); //memento is ignored

  let neutralFSA = new FSA();
  let m2 = neutralFSA.createMemento();
  neutralFSA.createState("A", [{next: "B"}])
  .restoreMemento(m2);
  assert(neutralFSA.showState() === "A");  
});

test('The Munchin Marius Acid Computer Destroyer', function() {
  let hotFSA = new FSA();
  hotFSA.nextState("test");
  assert(hotFSA.showState() === undefined);
  hotFSA.createState("A", [{next: "B"},{skip:"C"},{fly:"Z"}])
  .createState("Z", [{next: "Z"}])
  .addTransition("C", {next: "D"})
  .addTransition("C", {fly: "Z"})
  .createState("D", [{restart: "A"}]);

  let m = hotFSA.createMemento()
  assert(hotFSA.showState() === "A");
  hotFSA.nextState("skip"); 
  assert(hotFSA.showState() === "C");
  hotFSA.nextState("next");
  assert(hotFSA.showState() === "D");
  hotFSA.nextState("restart");
  assert(hotFSA.showState() === "A");
  hotFSA.nextState("fly");
  assert(hotFSA.showState() === "Z");

  hotFSA.addTransition("Z", {kateUpton: "69"});
  hotFSA.nextState("kateUpton");
  assert(hotFSA.showState() === "69");
  hotFSA.addTransition("69", {finished: "A"});

  m.getState().setName("Marius");  //Acid
  
  hotFSA.nextState("finished");
  assert(hotFSA.showState() === "Marius");
  hotFSA.createState("Marius", [{done: "done"}]);
  
  hotFSA.restoreMemento(m);
  hotFSA.nextState("done");
  assert(hotFSA.showState() === "done");
  hotFSA.nextState("whyNot");
  assert(hotFSA.showState() === undefined);
});

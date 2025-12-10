//  const molecules = [
//     {
//         name: "вода",
//         formula: "H2O",
//         structure: { H: 2, O: 1 }
//     },
//     {
//         name: "јаглерод диоксид",
//         formula: "CO2",
//         structure: { C: 1, O: 2 }
//     },
//     {
//         name: "кислород",
//         formula: "O2",
//         structure: {O: 2}
//     },
//     {
//         name: "метан",
//         formula: "CH4",
//         structure: {C:1, H:4}
//     },
//     {
//         name: "натриум хлорид",
//         formula: "NaCl",
//         structure: {Na: 1, Cl: 1}
//     }
// ];

// document.querySelectorAll(".atom").forEach(atom => {
//     atom.addEventListener("dragstart", e => {
//         e.dataTransfer.setData("atomType", e.target.dataset.atom);
//     });
// });

// const workspace = document.getElementById("workspace");

// workspace.addEventListener("dragover", e => {
//     e.preventDefault(); 
// });

// workspace.addEventListener("drop", e => {
//     e.preventDefault();

//     const atomType = e.dataTransfer.getData("atomType");

//     const newAtom = document.createElement("div");
//     newAtom.classList.add("placed-atom");
//     newAtom.innerText = atomType;

//     const rect = workspace.getBoundingClientRect();
//     newAtom.style.left = e.clientX - rect.left - 25 + "px";
//     newAtom.style.top = e.clientY - rect.top - 25 + "px";

//     workspace.appendChild(newAtom);


// });

// function checkMolecule() {
//     const placedAtoms = {};

//     document.querySelectorAll(".placed-atom").forEach(atom => {
//         const type = atom.innerText;
//         placedAtoms[type] = (placedAtoms[type] || 0) + 1;
//     });

//     for (const mol of molecules) {
//         let match = true;

//         for (const atomType in mol.structure) {
//             if (placedAtoms[atomType] !== mol.structure[atomType]) {
//                 match = false;
//                 break;
//             }
//         }

//         if (match) return mol; 
//     }

//     return null; 
// }

// document.getElementById("check-btn").addEventListener("click", () => {
//     const result = checkMolecule();

//     if (result) {
//         alert(`✅ Точно! Ја пронајде молекулата на ${result.name} (${result.formula})!`);
//     } else {
//         alert("❌ Погрешна молекула - пробај пак!");
//     }
// });

// document.getElementById("reset-btn").addEventListener("click", () => {
//     document.querySelectorAll(".placed-atom").forEach(atom => atom.remove());
// });

// =========================
// Molecule Templates
// =========================
// Add more molecules later easily
// "bonds" is an array of { a: "AtomType", b: "AtomType" }
// COMPLETE script.js — DOM-ready, robust placement, bonding, exact bond validation

document.addEventListener("DOMContentLoaded", () => {

    const molecules = [
      {
        name: "Water",
        formula: "H2O",
        atoms: { H: 2, O: 1 },
        bonds: [
          { a: "O", b: "H" },
          { a: "O", b: "H" }
        ]
      },
      {
        name: "Carbon Dioxide",
        formula: "CO2",
        atoms: { C: 1, O: 2 },
        bonds: [
          { a: "C", b: "O" },
          { a: "C", b: "O" }
        ]
      }
    ];
  
    const workspace = document.getElementById("workspace");
    const bondBtn = document.getElementById("bondBtn");
    const checkBtn = document.getElementById("checkBtn");
    const resetBtn = document.getElementById("resetBtn");
    const resultBox = document.getElementById("result");
  
    let atomCounter = 0;
    let bondMode = false;
    let bondFirstAtom = null;
  
    const placedAtoms = []; // {id, type, el}
    const placedBonds = []; // {atomAId, atomBId, atomAEl, atomBEl, lineEl}
  
    // ========== DRAG ATOMS ==========
    document.querySelectorAll(".atom").forEach(atom => {
      atom.addEventListener("dragstart", e => {
        e.dataTransfer.setData("atomType", atom.dataset.atom);
      });
    });
  
    workspace.addEventListener("dragover", e => e.preventDefault());
  
    workspace.addEventListener("drop", e => {
      e.preventDefault();
      const type = e.dataTransfer.getData("atomType");
      if (!type) return;
  
      const rect = workspace.getBoundingClientRect();
      const div = document.createElement("div");
      div.classList.add("placed-atom");
      div.innerText = type;
      div.dataset.id = String(atomCounter++);
      div.style.left = (e.clientX - rect.left - 25) + "px";
      div.style.top = (e.clientY - rect.top - 25) + "px";
  
      // click for bonding
      div.addEventListener("click", () => {
        if (!bondMode) return;
        handleBondClick(div.dataset.id);
      });
  
      workspace.appendChild(div);
      placedAtoms.push({ id: div.dataset.id, type, el: div });
    });
  
    // ========== BOND MODE ==========
    bondBtn.addEventListener("click", () => {
      bondMode = !bondMode;
      bondFirstAtom = null;
      bondBtn.innerText = bondMode ? "Click two atoms" : "Draw Bond";
    });
  
    function handleBondClick(atomId) {
      const atomObj = placedAtoms.find(a => a.id === atomId);
      if (!bondFirstAtom) {
        bondFirstAtom = atomId;
        atomObj.el.classList.add("selected-atom");
        return;
      }
  
      if (bondFirstAtom === atomId) {
        atomObj.el.classList.remove("selected-atom");
        bondFirstAtom = null;
        return;
      }
  
      const firstObj = placedAtoms.find(a => a.id === bondFirstAtom);
      const secondObj = atomObj;
  
      // prevent duplicate bond
      const exists = placedBonds.some(b =>
        (b.atomAId === firstObj.id && b.atomBId === secondObj.id) ||
        (b.atomAId === secondObj.id && b.atomBId === firstObj.id)
      );
      if (exists) {
        firstObj.el.classList.remove("selected-atom");
        bondFirstAtom = null;
        return;
      }
  
      const line = document.createElement("div");
      line.classList.add("bond-line");
      workspace.appendChild(line);
  
      const bond = { atomAId: firstObj.id, atomBId: secondObj.id, atomAEl: firstObj.el, atomBEl: secondObj.el, lineEl: line };
      placedBonds.push(bond);
      updateBondLine(bond);
  
      firstObj.el.classList.remove("selected-atom");
      bondFirstAtom = null;
    }
  
    function updateBondLine(bond) {
      const rect = workspace.getBoundingClientRect();
      const aRect = bond.atomAEl.getBoundingClientRect();
      const bRect = bond.atomBEl.getBoundingClientRect();
  
      const ax = aRect.left + aRect.width/2 - rect.left;
      const ay = aRect.top + aRect.height/2 - rect.top;
      const bx = bRect.left + bRect.width/2 - rect.left;
      const by = bRect.top + bRect.height/2 - rect.top;
  
      const dx = bx - ax;
      const dy = by - ay;
      const length = Math.sqrt(dx*dx + dy*dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  
      bond.lineEl.style.left = ax + "px";
      bond.lineEl.style.top = ay + "px";
      bond.lineEl.style.width = length + "px";
      bond.lineEl.style.transform = `rotate(${angle}deg)`;
    }
  
    // ========== CHECK MOLECULE ==========
    checkBtn.addEventListener("click", () => {
      // count atoms
      const counts = {};
      placedAtoms.forEach(a => counts[a.type] = (counts[a.type]||0)+1);
  
      let molMatch = null;
      for (const mol of molecules) {
        if (sameAtomCounts(counts, mol.atoms)) {
          molMatch = mol;
          break;
        }
      }
  
      if (!molMatch) {
        resultBox.innerText = "❌ Incorrect molecule.";
        return;
      }
  
      // check bonds
      if (checkBondsExact(molMatch)) {
        resultBox.innerText = `✅ Correct! You built ${molMatch.name} (${molMatch.formula})`;
      } else {
        resultBox.innerText = "⚠️ Atom count correct, but bonds are incorrect.";
      }
    });
  
    function sameAtomCounts(placed, required) {
      const keys1 = Object.keys(placed).sort();
      const keys2 = Object.keys(required).sort();
      if (keys1.length !== keys2.length) return false;
      for (let k of keys2) if ((placed[k]||0)!==required[k]) return false;
      return true;
    }
  
    function bondKey(a,b){ return [a,b].sort().join("-"); }
  
    function checkBondsExact(mol){
      const required = {};
      mol.bonds.forEach(b => {
        const key = bondKey(b.a,b.b);
        required[key] = (required[key]||0)+1;
      });
  
      const placed = {};
      placedBonds.forEach(b => {
        const key = bondKey(b.atomAEl.innerText.trim(), b.atomBEl.innerText.trim());
        placed[key] = (placed[key]||0)+1;
      });
  
      // total bonds must match
      const totalReq = Object.values(required).reduce((s,n)=>s+n,0);
      const totalPlaced = Object.values(placed).reduce((s,n)=>s+n,0);
      if(totalReq!==totalPlaced) return false;
  
      for(const key in required) if((placed[key]||0)!==required[key]) return false;
      for(const key in placed) if((required[key]||0)!==placed[key]) return false;
  
      return true;
    }
  
    // ========== RESET ==========
    resetBtn.addEventListener("click", () => {
      placedAtoms.forEach(a => a.el.remove());
      placedAtoms.length = 0;
      placedBonds.forEach(b => b.lineEl.remove());
      placedBonds.length = 0;
      atomCounter = 0;
      bondFirstAtom = null;
      bondMode = false;
      bondBtn.innerText = "Draw Bond";
      resultBox.innerText = "";
    });
  
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const checkBtn = document.getElementById("checkBtn");
    const resultBox = document.getElementById("result");

    checkBtn.addEventListener("click", () => {
        resultBox.innerText = "✅ Button works!";
    });
});
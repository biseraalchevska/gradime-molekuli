document.addEventListener("DOMContentLoaded", () => {

    const molecules = [
        {
            name: "Вода",
            formula: "H2O",
            atoms: { H: 2, O: 1 },
            bonds: [
                { a: "O", b: "H", type: 1 },
                { a: "O", b: "H", type: 1 }
            ]
        },
        {
            name: "Јаглерод диоксид",
            formula: "CO2",
            atoms: { C: 1, O: 2 },
            bonds: [
                { a: "C", b: "O", type: 2 },
                { a: "C", b: "O", type: 2 }
            ]
        },
        // {
        //     name: "glukoza",
        //     formula: "C6H12O6",
        //     atoms: { C: 6, H: 12, O: 6 },
        //     bonds: [
        //         { a: "H", b: "C", type: 1 },
        //         { a: "H", b: "C", type: 1 },
        //         { a: "H", b: "C", type: 1 },
        //         { a: "H", b: "C", type: 1 },
        //         { a: "H", b: "C", type: 1 },
        //         { a: "H", b: "C", type: 1 },
        //         { a: "H", b: "C", type: 1 },
        //         { a: "O", b: "H", type: 1 },
        //         { a: "O", b: "H", type: 1 },
        //         { a: "O", b: "H", type: 1 },
        //         { a: "O", b: "H", type: 1 },
        //         { a: "O", b: "H", type: 1 },
        //         { a: "C", b: "O", type: 1 },
        //         { a: "C", b: "O", type: 1 },
        //         { a: "C", b: "O", type: 1 },
        //         { a: "C", b: "O", type: 1 },
        //         { a: "C", b: "O", type: 1 },
        //         { a: "C", b: "C", type: 1 },
        //         { a: "C", b: "C", type: 1 },
        //         { a: "C", b: "C", type: 1 },
        //         { a: "C", b: "C", type: 1 },
        //         { a: "C", b: "C", type: 1 },
        //         { a: "C", b: "O", type: 2 },
        //     ]
        // }
        // {
        //     name: "Сулфурна Киселина",
        //     formula: "H2SO4",
        //     atoms: { H: 2, S: 1, O: 4 },
        //     bonds: [
        //         { a: "H", b: "O", type: 1 },
        //         { a: "H", b: "O", type: 1 },
        //         { a: "S", b: "O", type: 2 },
        //         { a: "S", b: "O", type: 2 },
        //         { a: "S", b: "O", type: 1 },
        //         { a: "S", b: "O", type: 1 }
        //     ]
        // }
    ];

    const workspace = document.getElementById("workspace");
    const checkBtn = document.getElementById("checkBtn");
    const resetBtn = document.getElementById("resetBtn");

    const resultBox = document.getElementById("result");

    const singleBondBtn = document.getElementById("singleBondBtn");
    const doubleBondBtn = document.getElementById("doubleBondBtn");
    const tripleBondBtn = document.getElementById("tripleBondBtn");

    let atomCounter = 0;
    let bondMode = false;
    let bondFirstAtom = null;
    let currentBondType = 1;

    const placedAtoms = []; 
    const placedBonds = [];  

    // повлекување на атомот кон екранот
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

        // клик за врска
        div.addEventListener("click", () => {
            if (!bondMode) return;
            handleBondClick(div.dataset.id);
        });

        workspace.appendChild(div);
        placedAtoms.push({ id: div.dataset.id, type, el: div });
    });

    function setBondType(type) {
        bondMode = true;
        bondFirstAtom = null;
        currentBondType = type;
        [singleBondBtn, doubleBondBtn, tripleBondBtn].forEach(btn => btn.classList.remove("active-bond-btn"));
        if (type === 1) singleBondBtn.classList.add("active-bond-btn");
        if (type === 2) doubleBondBtn.classList.add("active-bond-btn");
        if (type === 3) tripleBondBtn.classList.add("active-bond-btn");
    }

    singleBondBtn.addEventListener("click", () => setBondType(1));
    doubleBondBtn.addEventListener("click", () => setBondType(2));
    tripleBondBtn.addEventListener("click", () => setBondType(3));

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

        const bond = {
            atomAId: firstObj.id,
            atomBId: secondObj.id,
            atomAEl: firstObj.el,
            atomBEl: secondObj.el,
            type: currentBondType,
            lineEls: []
        };

        // врските претставени визуелно
        for (let i = 0; i < currentBondType; i++) {
            const line = document.createElement("div");
            line.classList.add("bond-line");
            workspace.appendChild(line);
            line.dataset.offset = i - (currentBondType - 1) / 2;
            bond.lineEls.push(line);
            updateBondLine({ ...bond, lineEl: line });
        }

        placedBonds.push(bond);

        firstObj.el.classList.remove("selected-atom");
        bondFirstAtom = null;
    }

    function updateBondLine(bond) {
        const rect = workspace.getBoundingClientRect();
        const aRect = bond.atomAEl.getBoundingClientRect();
        const bRect = bond.atomBEl.getBoundingClientRect();

        const ax = aRect.left + aRect.width / 2 - rect.left;
        const ay = aRect.top + aRect.height / 2 - rect.top;
        const bx = bRect.left + bRect.width / 2 - rect.left;
        const by = bRect.top + bRect.height / 2 - rect.top;

        const dx = bx - ax;
        const dy = by - ay;
        const angle = Math.atan2(dy, dx);

        bond.lineEls.forEach(line => {
            const offset = line.dataset.offset * 6;
            const offsetX = -offset * Math.sin(angle);
            const offsetY = offset * Math.cos(angle);
            const length = Math.sqrt(dx * dx + dy * dy);

            line.style.left = (ax + offsetX) + "px";
            line.style.top = (ay + offsetY) + "px";
            line.style.width = length + "px";
            line.style.transform = `rotate(${angle}rad)`;
        });
    }

    window.addEventListener("resize", () => {
        placedBonds.forEach(updateBondLine);
    });

    // проверуваме дали молекулата е точна
    checkBtn.addEventListener("click", () => {
        const counts = {};
        placedAtoms.forEach(a => counts[a.type] = (counts[a.type] || 0) + 1);

        let molMatch = null;
        for (const mol of molecules) {
            if (sameAtomCounts(counts, mol.atoms)) {
                molMatch = mol;
                break;
            }
        }

        if (!molMatch) {
            resultBox.innerText = "Молекулата не е точна. Обидете се повторно.";
            return;
        }

        if (checkBondsExact(molMatch)) {
            resultBox.innerText = `Точна молекула! Ја изградивте ${molMatch.name} (${molMatch.formula})`;
        } else {
            resultBox.innerText = "Атомите се точни, но врските помеѓу нив се погрешни. Обидете се повторно";
        }
    });

    function sameAtomCounts(placed, required) {
        const keys1 = Object.keys(placed).sort();
        const keys2 = Object.keys(required).sort();
        if (keys1.length !== keys2.length) return false;
        for (let k of keys2) if ((placed[k] || 0) !== required[k]) return false;
        return true;
    }

    function bondKey(a, b, type) {
        const sorted = [a, b].sort();
        return `${type}:${sorted[0]}:${sorted[1]}`;
    }

    function checkBondsExact(mol) {
        const requiredCounts = {};
        mol.bonds.forEach(b => {
            const key = bondKey(b.a, b.b, b.type);
            requiredCounts[key] = (requiredCounts[key] || 0) + 1;
        });
    
        const placedCounts = {};
        placedBonds.forEach(b => {
            const aType = placedAtoms.find(a => a.id === b.atomAId).type;
            const bType = placedAtoms.find(a => a.id === b.atomBId).type;
            const key = bondKey(aType, bType, b.type);
            placedCounts[key] = (placedCounts[key] || 0) + 1;
        });
    
        const keys = new Set([...Object.keys(requiredCounts), ...Object.keys(placedCounts)]);
        for (let key of keys) {
            if ((requiredCounts[key] || 0) !== (placedCounts[key] || 0)) return false;
        }
    
        return true;
    }
    
    

    // започнуваме одново
    resetBtn.addEventListener("click", () => {
        placedAtoms.forEach(a => a.el.remove());
        placedAtoms.length = 0;

        placedBonds.forEach(b => b.lineEls.forEach(l => l.remove()));
        placedBonds.length = 0;

        atomCounter = 0;
        bondFirstAtom = null;
        bondMode = false;
        currentBondType = 1;
        [singleBondBtn, doubleBondBtn, tripleBondBtn].forEach(btn => btn.classList.remove("active-bond-btn"));
        resultBox.innerText = "";
    });

});

class NameMatched {
    skillNames = [];
    constructor(names) {
        this.skillNames = names;
    }
    match(skills) {
        let r = this.skillNames.find((name) => {
            return skills.some((v) => v.name == name && v.pp > 0);
        });
        if (!r) return r;
        return skills.find((v) => v.name === r).id;
    }
}

class DiedSwitchLinked {
    petNames = [];
    constructor(names) {
        this.petNames = names;
    }
    match(pets, dyingCt) {
        let swName = '';
        for (let pet of pets) {
            if (pet.catchTime == dyingCt) {
                swName = pet.name;
                break;
            }
        }
        if (!this.petNames.includes(swName)) return -1;
        swName = this.petNames[this.petNames.indexOf(swName) + 1];
        for (let pet of pets) {
            if (pet.name == swName) {
                if (pet.hp == 0) {
                    return -1;
                } else {
                    return pet.index;
                }
            }
        }
        return -1;
    }
}

export { DiedSwitchLinked, NameMatched };

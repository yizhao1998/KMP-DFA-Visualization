// forward link type
const FORWARD = 'forward';
// backward link type
const BACKWARD = 'backward';

const kmp = (pattern) => {
	const len = pattern.length;
	const characters = [];
	const charactersInverse = {};
	for (let i = 0; i < len; ++i) {
		if (!characters.includes(pattern[i])) {
			charactersInverse[pattern[i]] = characters.length;
			characters.push(pattern[i]);
		}
	}
	const R = characters.length;
	const M = len;
	let dfa = Array(R)
		.fill()
		.map(() => Array(M).fill(0));
	dfa[charactersInverse[pattern[0]]][0] = 1;
	for (let X = 0, j = 1; j < M; ++j) {
		for (let c = 0; c < R; ++c) {
			dfa[c][j] = dfa[c][X];
		}
		dfa[charactersInverse[pattern[j]]][j] = j + 1;
		X = dfa[charactersInverse[pattern[j]]][X];
	}
	// dfa is the result array
	// example:
	// kmp("ABABAC")
	// dfa is
	//       0, 1, 2, 3, 4, 5
	//    [
	//   A 	[1, 1, 3, 1, 5, 1],
	//   B	[0, 2, 0, 4, 0, 4],
	//   C	[0, 0, 0, 0, 0, 6],
	//    ];
	let nodes = Array.from(Array(M + 1).keys()).map((d) => {
		return { id: d, name: d };
	});
    let links = [];
    let selfLinks = [];
    for (let j = 0; j < M; ++j) {
        const selfLinkMap = {};
        const linkMap = {};
        for (let i = 0; i < R; ++i) {
            if (dfa[i][j] == j) {
                if (!selfLinkMap[j]) {
                    selfLinkMap[j] = {
                        node: j,
                        desc: characters[i]
                    };
                } else {
                    selfLinkMap[j].desc += "," + characters[i];
                }
            } else {
                let target = dfa[i][j];
                if (!linkMap[target]) {
                    linkMap[target] = {
                        source: j,
                        target,
                        type: target > j ? FORWARD : BACKWARD,
                        desc: characters[i]
                    };
                } else {
                    linkMap[target].desc += "," + characters[i];
                }
            }
        }
        console.log(linkMap);
        console.log(selfLinkMap);
        selfLinks = selfLinks.concat(Object.values(selfLinkMap));
        links = links.concat(Object.values(linkMap));
    }
    return {
        nodes,
        links,
        selfLinks
    };
};

// export default kmp;
console.log(kmp("ABABAC"));
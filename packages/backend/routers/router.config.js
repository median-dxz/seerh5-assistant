

export function queryPets(arg0, queryPets) {
    throw new Error('Function not implemented.');
}


export function petFragmentLevel(arg0, petFragmentLevel) {
    throw new Error('Function not implemented.');
}


export function realm(arg0, realm) {
    throw new Error('Function not implemented.');
}


export function cachePets(arg0, cachePets) {
    throw new Error('Function not implemented.');
}
// const dataFile = path.resolve(base, 'data', 'data.json');
// const data = JSON.parse(fs.readFileSync(dataFile).toString('utf8'));

// export const saDataProvider = (req, res, next) => {
//     res.setHeader('Cache-Control', 'no-cache');
//     switch (req.method) {
//         case 'GET':
//             res.status(200).json(data);
//             break;
//         case 'POST':
//             // 获取payload
//             const payload = req.body;

//             if (req.query.mod) {
//                 const mod = req.query.mod.toString();
//                 data.mods[mod] = payload;
//             } else {
//                 data[payload.key] = payload.value;
//             }

//             writeFileSync(dataFile, JSON.stringify(data, null, 4));

//             res.status(200)
//                 .json({
//                     code: 200,
//                     ok: true,
//                 })
//                 .end();
//             break;
//         default:
//             next();
//             break;
//     }
// };

import fs from 'fs'

const p = 'D:/semester 8/SWP391/Project-SWP/FE-HouseRacing/src/pages/referee/RefereeRaceDetail.jsx'
let c = fs.readFileSync(p, 'utf8')

const pattern =
  /  \/\/ Shared starting positions state \(horseId -> gate number\)\n  const \[startPositions, setStartPositions\] = useState\(\(\) => \{\n    const initial = \{\};\n    horses\.forEach\(\(h, i\) => \{ initial\[h\.id\] = i \+ 1; \}\);\n    return initial;\n  \}\);/

const replacement = `  const [startPositions, setStartPositions] = useState({})

  useEffect(() => {
    const initial = {}
    horses.forEach((h, i) => {
      initial[h.id] = i + 1
    })
    setStartPositions(initial)
  }, [race?.id, horses])`

if (!pattern.test(c)) {
  console.error('Pattern not found')
  process.exit(1)
}

c = c.replace(pattern, replacement)
fs.writeFileSync(p, c)
console.log('Fixed startPositions init')

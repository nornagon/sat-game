import React, { useState } from 'react';
import './App.css';
import { isLiteral } from '@babel/types';

type Literal = { variable: string, negated: boolean }

type Clause = Literal[]

type SatProblem = {
  clauses: Clause[]
}

type Assignment = {
  values: Record<string, boolean>
}

const testProblem: SatProblem = {
  clauses: [
    [ { variable: 'x', negated: false }, { variable: 'y', negated: true } ],
    [ { variable: 'x', negated: true }, { variable: 'y', negated: false } ],
  ]
}
const quinn: SatProblem = {clauses:`1    2  0
-2   -4  0
 3    4  0
-4   -5  0
 5   -6  0
 6   -7  0
 6    7  0
 7  -16  0
 8   -9  0
-8  -14  0
 9   10  0
 9  -10  0
-10  -11  0
10   12  0
11   12  0
13   14  0
14  -15  0
15   16  0`.split('\n').map(line => line.trim().split(/\s+/).filter(x => x !== '0').map(Number).map(n => ({variable: Math.abs(n).toString(), negated: n < 0})))}
const unsat = {clauses:`1  2 -3 0
-1 -2  3 0
 2  3 -4 0
-2 -3  4 0
 1  3  4 0
-1 -3 -4 0
-1  2  4 0
 1 -2 -4 0`.split('\n').map(line => line.trim().split(/\s+/).filter(x => x !== '0').map(Number).map(n => ({variable: Math.abs(n).toString(), negated: n < 0})))}


const Variables = ({problem, setVariable, assignment}: {problem: SatProblem, setVariable: (variable: string, value: boolean) => void, assignment: Assignment}) => {
  const allVariables = Array.from(new Set(problem.clauses.flatMap(c => c.map(l => l.variable)))).sort((a, b) => Number(a) - Number(b))
  return (
    <div className="variables">
      {allVariables.map(variable => (
        <div className="variable">
          <div className={`variable-name assigned-${assignment.values[variable]}`}>{variable}</div>
          <div className="variable-nodes">
            <div className="positive">
              {problem.clauses.map(clause => {
                const literal = clause.find(l => l.variable === variable)
                const conflicting = clause.every(l => assignment.values[l.variable] === l.negated)
                if (literal && !literal.negated) {
                  const assigned = assignment.values[variable]
                  return <div className={`node involved ${assigned === true ? 'assigned' : assigned === false ? 'negated': ''} ${assigned} ${conflicting ? 'conflicting' : ''}`} onClick={() => setVariable(variable, true)}></div>
                } else {
                  return <div className={`node empty ${conflicting ? 'conflicting' : ''}`}></div>
                }
              })}
            </div>
            <div className="negative">
              {problem.clauses.map(clause => {
                const literal = clause.find(l => l.variable === variable)
                const conflicting = clause.every(l => assignment.values[l.variable] === l.negated)
                if (literal && literal.negated) {
                  const assigned = assignment.values[variable]
                  return <div className={`node involved ${assigned === false ? 'assigned' : assigned === true ? 'negated': ''} ${assigned} ${conflicting ? 'conflicting' : ''}`} onClick={() => setVariable(variable, false)}></div>
                } else {
                  return <div className={`node empty ${conflicting ? 'conflicting' : ''}`}></div>
                }
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function unitPropagate(assignment: Record<string, boolean>, problem: SatProblem): Record<string, boolean> {
  function isUnit(clause: Clause): boolean {
    let numUnassigned = 0
    for (const literal of clause) {
      const value = assignment[literal.variable] != null ? assignment[literal.variable] !== literal.negated : null
      if (value === true)
        // If some literal in the clause is fixed to true, then the clause
        // cannot be unit.
        return false
      if (value === null) {
        numUnassigned++
        if (numUnassigned > 1)
          // If there's more than one unassigned variable in the clause, it is
          // not unit.
          return false
      }
    }
    return numUnassigned === 1
  }
  while (true) {
    const unitClause = problem.clauses.find(isUnit)
    if (!unitClause) return assignment
    // Find the unassigned variable in the clause and assign it.
    const unassignedLiteral = unitClause.find(literal => assignment[literal.variable] == null)!
    assignment[unassignedLiteral.variable] = !unassignedLiteral.negated
  }
}

function assign(variable: string, value: boolean, assignment: Assignment, problem: SatProblem) {
  const newValues = {...assignment.values, [variable]: value}
  const newAssignment = {...assignment, values: newValues}
  unitPropagate(newAssignment.values, problem)
  return newAssignment
}

const App: React.FC = () => {
  const [assignment, setAssignment] = useState({values: {}} as Assignment)
  const problem = quinn
  return (
    <div className="App">
      <Variables
        problem={problem}
        setVariable={(variable, value) => setAssignment(assign(variable, value, assignment, problem))}
        assignment={assignment}
        />
    </div>
  );
}

export default App;

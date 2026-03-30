# [Technical Writing Name]

## Document Signature


|           |        |
|-----------|--------|
| Creator   | [name] |
| Leader    | [name] |
| Task Link | [url]  |
| Developer | [name] |

## Background / Problem Statement
[ Explain problem statement that currently happened ]

Good problem explanation:
1. Explain current situation
2. Explain the problem and that why it matters
3. Differentiate fact from opinion
4. Would be great if you can state the data


## Goals
[ Explain conditions that you want to achieve ]

Good goals' explanation:
1. Describe how things should work
2. Explain the impact after the goals have been reached

Example:
1. Reduce API calls to X from 3x to 1x
2. Decrease cost of redis from $300 to $150


## Non-Goals
[ Explain conditions that are not included in development scope but considered to be a potential improvement ]

Good non-goals explanation:
1. State potential question that related to the development

Example:
1. Vendor will be requested to change URL after this IP whitelisting has been done

## Functional Requirements
[ Explain system requirements that need to be addressed ]

Example:
1. Expected RPS to handle: XX RPS
2. Maximum latency: XX ms

## Solution Options
[ Explain changes that need to be done ]

Good solution explanation:
1. State any option that you have, 2 alternatives solutions at max with each benefits and drawbacks
2. For table/DB design changes, please incorporate SQL that will be executed
3. Explain current flow and solution flow
4. State flow that you need to change

Example:
**Option 1**
1. Create http handler **mountian_scoring.go** that will accept 1 parameter; mountain_id, token
    - Authenticate request
    - Validate input
    - Call service
    - Render response
2. Crete service **mountain_scoring.go**
    - Check if mountain_id already exists in database
        - No: throw error
        - Yes: continue to step b
    - ...
3. ...

## Design
[ Sequence diagram or Flowchart ]

## Potential Impact
[ Explain impact that potentially exists after development done ]

Example:
1. Potential growth of database size usage of mountain-fun to 100GB after several days
2. Potential CPU increase on database mountain-fun if someone export data from inhouse dashboard

## Test Plan
[ Explain how we can test the feature ]

Example:
1. Call API get mountain scoring
2. Check scoring result
3. Validate with planned formula

## Deployment Plan
[ Explain how we plan deployment ]
1. Does this feature has backward compatibility? Yes/No
2. Can we make partial deployment? Yes/No
3. Who needs to be notified about this deployment?
4. What configuration changes that need to be prepared?
5. Is there any DDL or DML needed before deployment?

## Rollback Plan
[ A plan that if your changes goes wrong in production ]
1. Notify the cause to Slack channel
2. [If needed] Toggle of feature flag
3. Stop deployment
4. Revert / Fix Changes
5. [If needed] Prepare a script to fix inserted data

## Post Deployment
- Checklist
    - Check feature using GUI
    - etc
- Metrics
    - Business metrics: number of success requests, error rate, etc
    - Tech metrics: max latency, avg latency, rps, max rps, etc
- Alerting
    - Success rate:
        - Warning: < 99%
        - Danger: <= 95%
    - Missing data / timeout:
        - Warning: >= 5 minutes
        - Danger: >= 1 hour

## Reviewed by
- Technical Architect: [name]
- Technical Leader: [name]
- Peers: [name]
- Peers: [name]
- Peers: [name]
- Peers: [name]

# Stride MVP Build Order.

I am building this in June. These are the only features that need to exist for V1 to be worth shipping.

## 1 Goal creation: habit or milestone type

Simple form. Goal name, type selection `(habit vs milestone)`, daily check-in reminder time. If milestone, add an end date and a list of steps. This is the data model everything else sits on. Get this right before touching anything else.

**React form + localStorage or simple backend**

## 2 Daily check-in with streak counter

One button per goal  `"Done today ✓"`. Tapping it logs a time stamp and increments the streak. If the user misses a day, the streak resets to zero the following day. The timestamp is stored, not just the count. This matters for the partner feature later and prevents backdating.

**Core loop, users come back for this**

## 3 Tonight's mission, evening prompt

A text input that appears each evening at a set time (or always visible from the dashboard). `"What is your mission for tomorrow?"` One sentence, saved. Displayed prominently the next morning when the app opens. Becomes a private log over time, scrollable history of daily intentions.

**Your biggest differentiator from day one**

## 4 Streak milestone moments [7, 30, 60, 90 days]

When a streak hits a milestone number, trigger a full-screen moment, a congratulations animation, the milestone number large on screen, a message. `"30 days. You showed up."` Simple but emotionally significant. This is the moment users take a screenshot and share.

**Makes the streak feel earned, not just counted**

## 5 Shareable streak card

At milestones (and on demand), generate a simple shareable card showing: goal name, streak count, today's date, and the Stride name. Copy as text to clipboard first, designed to paste on LinkedIn or WhatsApp. A proper image card comes in V2 when you add canvas rendering. Text version ships fast and still works.

**Free marketing, every share brings new users**

## 6 Weekly review, Sunday prompt

Every Sunday, a prompt appears with 5 questions ,one at a time, full focus: 

1) What did you complete? 

2) What did you skip? 

3) What got in the way? 

4) What did you learn? 

5) What's your mission next week? 

Answers saved privately. No analytics yet, just the habit of reflection built in from day one.

**Builds the reflection habit before analytics exist**

## What is NOT in V1 (intentionally)

No partner pairing. No circles. No analytics dashboard. No public profiles. No payments. No social feed. These come after you have 50 real users telling you what they actually need. Build the core loop first, **everything else is a distraction until the core works.**

### Trust & verification model, across versions

## V1 Full self-report, no verification

User clicks done. Timestamp is logged. They can't backdate it but they can lie. That's fine, this is a self-accountability tool. Lying to yourself defeats the purpose and the user knows it.

## V2 Social visibility, timestamp as proof

Your partner sees your check-in time. You can't fake when you tapped, the log shows it. Social visibility creates honest behaviour without surveillance.

## V2 Optional evidence attachment

`"Show your work"` - attach a photo, a note, or a link when you check in. A screenshot of the GitHub commit. A photo of the page you read. Optional, not forced. Makes the check-in feel real.

## V3 Circles peer pressure

In a group of 3–5, everyone sees everyone's check-in times. Public visibility within the circle creates honest behaviour at scale, same reason people behave differently when someone is watching.

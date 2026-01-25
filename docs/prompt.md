# Prompts

Prompts are built by providing a specific set of instructions along with a specific course outline.

## Course outline

A majority of the behaviour of the bot comes from what Sam knows about students taking the specific course mentioned. For this reason, we've created custom course outlines. These outlines have some extra custom information not usually present in regular outlines:

### Prerequisite knowledge

Tutors of each course understand a general baseline of knowledge that students usually have. Using this to create a list of prerequisite knowledge in the outline allows Sam to explain concepts at a much better level than other generative AI tools.

### New knowledge

A curated list of concepts that are not only consise but also completely sufficient in explaining the scope of the course

### Excluded knowledge

Detailing what isn't in the course allows us to find common places where Generative AI might explain things that are outside of the course even when given a regular course outline. These are found during testing. Providing this section allows us to be confident that Sam will never teach things that aren't required, at least without the student being fully aware.

## Instructions

Three different modes are provided in order to address any kind of question a student might have. These are selected automatically before responding to each question.

This creates an agentic workflow, where the question is first triaged to determine which of the following three agents is best suited for the question. They consist of the following:

### Concept Tutor

In concept mode, Sam will respond with long, detailed explanations. Most of the instructions in this mode have to do with ensuring quality of these explanations. 

### Problem Tutor

In problem mode, Sam will respond socratically. This is the main, most impressive mode of Sam. It will allow students to work through problems without giving away answers.

### General Tutor

The "Other" mode is a catch-all mode for all types of questions that don't require problem solving for Sam to answer, i.e. "what's on the midterm" or other questions not directly related to problems or concepts.


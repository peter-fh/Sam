# Prompts

Course specific prompts are stored in <repo-path>/prompt/course, and instructions are stored in <repo-path>/prompt/instructions

## Instructions

When questions about a problem are asked, the instructions defined in problem_prompt.md are included in the API request. When questions about a concept are asked, the contents of concept_prompt.md are sent. There is always only one set of instructions sent, meaning there is never a case where none or both of these prompts are included.

## Course information

After instructions for a specific type of question is sent, the information for the course the student selected is also included in the API request.

This course information is stored in course/{COURSE_CODE}.md.


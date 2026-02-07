# React + Typescript front-end

This is the frontend for the ai chatbot, written in react + typescript. The docker image for deployment builds this file and copies the built files from `/frontend/dist/` into `/static`.

## Routes

This project uses react-router-dom to serve separate routes. 

### /

The default route serves the disclaimer and the modals that require students to pick their course and question type. Once these are selected, they are redirected to /chat

### /chat

Main chat page with sidebar on the left

### /chat:id

If a previous chat is selected, they are directed to chat:id where id is the conversation id stored in the database. This allows linking to specific conversations via URL. Equivalent to /chat except for the content of the conversation


## Latex + Markdown rendering

After a lot of trial and error, I found that the best way to render Latex and Markdown at the same time in an actively streamed API response is by using the regular MathJax javascript package (MathJax.typeset()), included as a script tag in index.html, and marked (marked.parse()). The calls to these libraries are done via the MarkTeX hook defined in src/hooks/MarkTeX.tsx.

## Modals

In order to ensure that the student chooses the course and type of problem they are asking about before interacting with the chatbot, a modal is shown that blocks the rest of the UI until the selections are made. There are currently three, one for the disclaimer, one for selecting a course, and another for selecting the type of problem. These modals are defined in src/components/Modal/Modal.tsx


## CSS

This project uses raw css defined in .css files for each corresponding .tsx file. The styling for this project is not super organized and may not necessarily follow any conventions. Contributions that can help organize the stylesheets of this project, even bringing in a dependency like Tailwind, are welcome.

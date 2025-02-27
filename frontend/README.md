# React + Typescript front-end

This is the frontend for the ai chatbot, written in react + typescript.

## CSS

This project uses raw css defined in .css files for each corresponding .tsx file. The styling for this project is not super organized and may not necessarily follow any conventions. Contributions that can help organize the stylesheets of this project, even bringing in a dependency like Tailwind, are welcome.

## Chat Context

The information that is required to process an OpenAI API request is stored in the chat context, in src/context/useChatContext.tsx. This includes the course, detail level, and question type. All of the types are stored as enums in src/types/options.ts.

Any component that has a way for the user to change options for how ChatGPT should respond to their messages should interact with the global state. 

For example, a component that allows the student to select which course they are asking about should retrieve the value and setter from the global state:

```ts
  const { course, setCourse } = useChatContext()
```

The function to interact with this component should call the setter, for example:


```ts
const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
  setCourse(event.target.value as Course)
}
```

When possible, the component should rely only on the type to list each of the options. This allows us to only change the types/options.ts file in order to add a new value to a specific option.

For example, the course select is created by mapping over the Course type:

```ts
<select className="select-box" onChange={onChange} value={course}> 
  {Object.values(Course).map((option) => (
  <option key={option} value={option}>
    {option}
  </option>
  ))}
</select>
```

If a new course is added to the Courses enum in src/types/options.ts, it will automatically be added to this enum.

## Latex + Markdown rendering

After a lot of trial and error, I found that the best way to render Latex and Markdown at the same time in an actively streamed API response is by using the regular MathJax javascript package (MathJax.typeset()), included as a script tag in index.html, and marked (marked.parse()). The calls to these libraries are done via the MarkTeX hook defined in src/hooks/MarkTeX.tsx.

## Modals

In order to ensure that the student chooses the course and type of problem they are asking about before interacting with the chatbot, a modal is shown that blocks the rest of the UI until the selections are made. There are currently three, one for the disclaimer, one for selecting a course, and another for selecting the type of problem. These modals are defined in src/components/Modal/Modal.tsx

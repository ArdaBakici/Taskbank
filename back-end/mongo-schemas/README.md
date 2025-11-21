# Mongo schemas (quick guide)

Import at the top of your route/controller:
```js
const { Task, Project } = require("../mongo-schemas");
```

## What’s here
- `Task`: matches `back-end/data/tasks.js` — fields like `title`, `projectId`, `tags`, `deadline`, `urgency`, `status`, `priority`, `context`, `order`.
- `Project`: matches `back-end/data/projects.js` — fields like `name`, `tags`, `deadline`, `urgency`, `status`.

## Usage examples
```js
/* 
⚠️ WARNING (important): Import the mongoDB stuff first! 
*/
const { Task, Project } = require("../mongo-schemas");





// Create a task
const created = await Task.create({
  title: "Wire up Mongoose",
  projectId: 1,
  priority: "high",
});

// Read tasks with sorting
// 1 = ascending, -1 = descending
const tasks = await Task.find({ status: "In Progress" }).sort({
  deadline: 1,  // earliest first
  priority: -1, // highest first
});

// Delete a task
await Task.findByIdAndDelete(created._id);

// List projects sorted by deadline
const projects = await Project.find().sort({ deadline: 1 });

// Delete a project
await Project.findByIdAndDelete("projectObjectIdHere");
```

## Update an entry: Use findById + change properties of task + task.save() afterwards 
```js
const task = await Task.findById("taskObjectIdHere");
if (!task) {
  // handle not found
  return;
}

// mutate and change fields of it and then REMEMBER TO save
task.status = "Completed";
await task.save(); // ⚠️⚠️ YOU MUST SAVE

// or delete it
await task.deleteOne();
```

## IDs and migration
- ⚠️⚠️ `_id` is the new `id` → use `_id` everywhere in routes/controllers and payloads. Old numeric `id` is gone.
- ⚠️ MongoDB auto-creates `_id` for you; you normally don’t set it yourself. You can set `_id` manually, but avoid unless you have a strong reason.
- Migration tip: if a request still sends `id`, map it to `_id` before querying.

## See the schemas if you want
- Check `back-end/mongo-schemas/Task.js` and `back-end/mongo-schemas/Project.js` to view the schemas.

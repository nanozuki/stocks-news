# Shape-Driven Development

Shape-Driven Development is a methodology for agentic coding. A directory opts into the methodology
by containing a `SHAPE.md` file. Once the file exists, every design change to the code it manages
starts in `SHAPE.md` and is then applied to the implementation.

A shape is the design description of a code file. Each file description explains the file's role and
any observable side effects caused by loading it. Each signature description explains the symbol's
purpose, intended use, and observable behavior, including side effects, errors, and constraints when
they matter.

The signatures and their descriptions form a file's surface. A surface contains the exported symbols
and externally accessible members that other code can use and depend on.

Drift is any meaningful difference between the documented shape and the implementation.

A `SHAPE.md` file must include every directly contained code file that either has a surface or causes
observable side effects when loaded. The file does not describe subdirectories, and parent and child
directories opt in independently. Before reading or changing a code file, the agent must check its
directory for `SHAPE.md` and read it when present.

## Shape file

The shape file is named `SHAPE.md`. It follows this template, written in Mustache syntax:

```mustache
# {{directory_name}}

{{directory_description}}

{{#files}}
## `{{file_name}}`

{{file_description}}

{{#signatures}}
### `{{signature}}`

{{signature_description}}
{{/signatures}}
{{/files}}
```

The directory description explains the shared role of the listed files. The file entries are sorted
by filename. Each file description explains its role and records any side effects caused by loading
it. A file with load-time side effects but no surface has no signature entries.

Every exported symbol and externally accessible member has a separate signature entry. The entries
are flat and sorted by their rendered signatures. Each signature uses the source language's notation,
contains the symbol's qualified name, and includes no implementation. It omits only visibility
keywords such as `export` and `public`, because inclusion in the surface already establishes external
accessibility. A signature does not add type information that the source language does not express;
the description records any details needed to understand and use the symbol.

For example:

```text
### `class Counter`

A mutable integer counter initialized to zero.

### `Counter.increment(): void`

Increases the current value by one.

### `Counter.reset(): void`

Sets the current value to zero.
```

## Skill

### `shape`

The model-invoked `shape` skill loads this methodology when the user mentions shapes or when the
agent works with code in a directory containing `SHAPE.md`. It does not impose a fixed workflow. The
user's instruction determines the operation.

The skill may generate `SHAPE.md` from code only for a directory that does not already contain the
file. Once `SHAPE.md` exists, the agent treats it as the entry point for design changes: it updates
the shape first and then applies the result to code. It never regenerates an existing `SHAPE.md`
from code.

When the user asks to update an existing `SHAPE.md` from code, the agent first reports the drift and
waits for confirmation. It then records the confirmed design in `SHAPE.md` before making the code
match it. When the user's instruction already establishes `SHAPE.md` as the target, the agent applies
it without requesting another confirmation. A request to check for drift only reports differences
and does not modify either side.

For example, the skill can follow instructions such as:

- "Generate `SHAPE.md` files for the source directories in this project."
- "Apply my `SHAPE.md` changes to the code."
- "Check for drift between `SHAPE.md` and the code."

---
name: shape
description:
  Shape-Driven Development rules for SHAPE.md files. Use when creating, updating, applying, or
  checking SHAPE.md, or when reading or changing code in a directory that contains SHAPE.md.
---

# Shape-driven development

A directory opts into Shape-Driven Development by containing a `SHAPE.md` file. Once the file
exists, every design change to the code it manages starts in `SHAPE.md` and is then applied to the
implementation.

## Follow the user's direction

For every code file in scope, check its own directory for `SHAPE.md`. Read the file when present.
`SHAPE.md` applies only to code files directly in its directory. Parent and child directories opt in
independently.

Follow the branch established by the user's instruction:

- To generate shapes, create `SHAPE.md` only in directories where it does not exist. Derive it from
  the current code. Cover every managed file and every surface entry before completing generation.
- To make a design change in a directory with `SHAPE.md`, record the intended design there first,
  then change the code to match it.
- To apply changes the user has already made to `SHAPE.md`, treat those changes as the target and
  make the code match them without requesting another confirmation.
- To update an existing `SHAPE.md` from code, compare the two first and report every drift. Wait for
  the user to confirm the intended design, then record it in `SHAPE.md` before making the code
  match.
- To check for drift, compare every managed file and surface entry, report every meaningful
  difference, and leave both `SHAPE.md` and the code unchanged.

A directory without `SHAPE.md` follows the project's normal development process unless the user asks
to generate one.

## Shape semantics

A **shape** is the design description of a code file. Its file description explains the file's role
and any observable side effects caused by loading it. Its signature descriptions explain each
symbol's purpose, intended use, and observable behavior, including side effects, errors, and
constraints when they matter.

A file's **surface** consists of the exported symbols and externally accessible members that other
code can use and depend on, together with their descriptions.

**Drift** is any meaningful difference between the documented shape and the implementation.

A `SHAPE.md` file covers every directly contained code file that either has a surface or causes
observable side effects when loaded. It does not cover subdirectories. A file with load-time side
effects but no surface has a file entry with no signature entries.

## Shape file format

Name the shape file `SHAPE.md` and use this structure:

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

The directory description explains the shared role of the listed files. Sort file entries by
filename. Each file description explains the file's role and records any side effects caused by
loading it.

Give every exported symbol and externally accessible member a separate signature entry. Keep the
entries flat and sort them by their rendered signatures. Each signature uses the source language's
notation, contains the symbol's qualified name, and includes no implementation. Omit only visibility
keywords such as `export` and `public`; keep all other declaration information. Do not add type
information that the source language does not express. Put any details needed to understand and use
the symbol in its description.

For example:

```text
### `class Counter`

A mutable integer counter initialized to zero.

### `Counter.increment(): void`

Increases the current value by one.

### `Counter.reset(): void`

Sets the current value to zero.
```

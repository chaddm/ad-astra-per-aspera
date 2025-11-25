You will now act as the orchestrator for building a feature.  Your goal is to
accomplish user prompt's request by delegating tasks to subagents and overseeing
the process and results.

Instructions:

1. You must delegate to @deep-builder the exact and complete user prompt.
2. Evaluate the results from @deep-builder by delegating to @general with
   instructions on how to validate the work done.
3. If the results are satisfactory, return a report on work done.
4. If the results are not satisfactory, delegate back to @deep-builder with
   the results from @general and requesting for fixes.
5. Repeat steps 2-4 until the results are satisfactory.

User Prompt: $ARGUMENTS
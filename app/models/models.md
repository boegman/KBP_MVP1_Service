# Models #

Models are used to persist into mongo - Not all services would need a DB but if they do, this is a useful way to implement persistance.

Ideally a services should persist into and read from it's own DB (Atomic behaviour).  If any 'external' DB's are accessed, this should be considered propperly to avoid interdependencies, remember this service does not have to be on the same 'intranet' as the one that 'owns' the DB you're accessing.

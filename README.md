Senior Project
==
A Google Chrome Add-one to make the download easy and fast.
Using third party downloading tool Aria2.

Features
--
Make your **Chrome** browser support following features
via[**Aria2**](http://aria2.sourceforge.net/)(a third part open source downloader)
+ Support Discontinue Downloading
+ Support Parallel Downloading
+ [Bit-torrent](https://en.wikipedia.org/wiki/BitTorrent)
+ ~~A Server (php, jsp, asp)~~

Requirement
--
+ [Chrome](https://www.google.com/chrome/) (Version 30.0.1599.9 or above)
+ [Aira2](http://aria2.sourceforge.net/) (Version 1.19.2 or above)

Instructions
--

1. Download[Aria2](http://aria2.sourceforge.net/)
- unzip or compile it to the location that you want it to run
2. Git clone or download the package (unzip the package)
- Copy**aria2c.conf**file to the location of**Aria2**
- Edit**aria2c.conf**file, replace "[required!]" to the path where you want to

  >dir=[required!]
3. Start the daemon process via this command

   ```bash
   >aria2c --conf-path=aria2c.conf
   ```
   or following with**D**if you want to close the shell after starting the daemon process

   ```bash
   >aria2c --conf-path=aria2c.conf -D
   ```
4. Load the package in the**chrome**with*developer mode*
5. Enjoy


Components
--
+ [jQuery](http://jquery.com/)
+ [Bootstrap](http://getbootstrap.com/)
+ [AngularJS](https://angularjs.org/)
+ [JSON RPC 2.0 jQuery Plugin](https://github.com/datagraph/jquery-jsonrpc)
+ ~~SQLite~~

Development Environment
--
- [IntelliJ IDEA](https://www.jetbrains.com/idea/) (Version 15.0)
  - Plugins
    * .ignore
    * GitHub
    * HTML Tools
    * Markdown Support
- Debugger
  - Fiddler
- Browser
  - Chrome Browser
  - ~~Safari~~
- OS
  - Windows
  - Max OS

Contributors
--
[JoeyWNK](https://github.com/JoeyWNK)
[HimmyCircle](https://github.com/HimmyCircle)
[darkzydark](https://github.com/darkzydark)
[ChengFeng](https://github.com/cfeng01)

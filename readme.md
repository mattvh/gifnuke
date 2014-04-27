# Installation

Note: Before installing GIFnuke, you must have ffmpeg installed and compiled with the `--enable-libvpx` option, in order to enable WebM encoding.

    npm install gifnuke -g

Or:

    git clone https://github.com/redwallhp/gifnuke.git
    cd gifnuke
    npm install
    npm link


# Converting an image

Run GIFnuke on an input GIF, and specify a name for the converted file. After the gears in your computer whir for awhile, you should get a shiny new .webm file in the directory you ran it in.

    gifnuke badformat/myimage.gif myimage

If you're converting a fancy GIF using that transparent partial-frame voodoo to reduce file size, you may need to run GIFnuke with the `--coalesce` flag. This requires that you have Imagemagick installed, as it takes advantage of the `convert` command to preprocess the GIF.
 
    # Convert an image with frame coalescing
    gifnuke badformat/myimage.gif myimage --coalesce
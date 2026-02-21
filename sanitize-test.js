/**
 * This is a JSDoc block.
 * It should be PRESERVED.
 * @param {string} msg 
 */
function testDoc(msg) {
    
    
    console.log("This console.log should be PRESERVED.");

    
    const x = 10; 

    /**
     * Another JSDoc.
     * Should be PRESERVED.
     */
    return msg + x;
}

testDoc("Hello");

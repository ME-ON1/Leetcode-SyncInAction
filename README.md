# LC-SyncInAction

Why take the effort of copy/pasting manually when you can make use of technology to do it for ya.

LC-SyncInAction solves this problem and takes your cookie in his hand to pull and push your Accepted solution everyday.

First run will pull all your Accepted solutions from LC ( which will take **1h 46 min to 2h 30 min approx** ) and create those submission in the current repository in the specified directory (root, if not provided )  

All the run afterwards will fetch your last 20 Accepted submission everyday at 8AM UTC ( 1:30 IST ) daily.

### Requirements : 

`cookie` value from the request headers  https://leetcode.com/<your-username> 

This cookie value has to be saved as a repository secret named as `cookieVal` which **has to be** passed as `${{ secrets.cookieVal }}` into action step [you can look here on how to do save a repository secret](https://docs.github.com/en/actions/reference/encrypted-secrets#creating-encrypted-secrets-for-a-repository)

You can also pass location of directory, to option `solution_location` , where would you like to collect all your solutions ( the default is root directory ). 

## Usage

Example use case of this action in your WORKFLOWS.

    jobs : 
      build :
        run-on : ubuntu-latest 

      steps : 
        -name : Using LC-Collectinator
         uses : ME-ON1/Leetcode-SyncInAction
            with :
              cookieVal : ${{ secrets.cookieVal }} # secrets.cookieVal coming from repository secret    
              solution_location : 'path/to/directory'  # if any , default is root '.'


## License

The scripts and documentation in this project are released under the [MIT License]()
  
  

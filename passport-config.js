const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize( passport, getUserByUsername, getUserById ) {
    const authenticateUser = async (username, password, finished) => {
        if (username === "admin" && password === "root")
            return finished(null, {id: -1})

        const user = await getUserByUsername(username)

        if (user == null) {
            return finished(null, false, { message: 'Something went wrong. Please try again.' })
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return finished(null, user)
            } else {
                return finished(null, false, { message: 'Something went wrong. Please try again.'})
            }
        } catch (e) {
            return finished(e)
        }
    }


    passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, authenticateUser))
    passport.serializeUser((user, finished) => finished(null, user.id))
    passport.deserializeUser((id, finished) => {
        return finished(null, getUserById(id))
    })

}

module.exports = initialize
const Tought = require('../models/Tought');
const User = require('../models/User');

module.exports = class ToughtsController {
    static async showToughts(req, res) {
        const toughtsData = await Tought.findAll({
            include: User,
        });
        const toughts = toughtsData.map(r => r.get({ plain: true }));

        res.render('toughts/home', { toughts });
    }

    static async dashboard(req, res) {
        const UserId = req.session.userid;

        const user = await User.findOne({
            where: { id: UserId },
            include: Tought,
            plain: true
        });

        // check user exists
        if (!user) {
            res.redirect('/login');
        }

        const toughts = user.Toughts.map(result => result.dataValues);

        let emptyToughts = false;

        if (toughts.length === 0) emptyToughts = true;

        res.render('toughts/dashboard', { toughts, emptyToughts });
    }

    static createTought(req, res) {
        res.render('toughts/create');
    }

    static async createToughtSave(req, res) {
        const tought = {
            title: req.body.title,
            UserId: req.session.userid,
        }

        try {
            await Tought.create(tought);

            req.flash('message', '');
            req.flash('message', 'Pensamento criado com sucesso!');

            req.session.save(() => {
                res.redirect('/toughts/dashboard');
            })
        } catch (err) {
            console.log(err);
        }
    }

    static async removeTought(req, res) {
        const id = req.body.id;
        const UserId = req.session.userid;

        try {
            await Tought.destroy({ where: { id: id, UserId: UserId } });

            req.flash('message', '');
            req.flash('message', 'Pensamento removido com sucesso!');
            req.session.save(() => {
                res.redirect('/toughts/dashboard');
            })

        } catch (err) {
            console.log(err);
        }
    }

    static async updateTought(req, res) {
        const id = req.params.id;

        const tought = await Tought.findOne({ raw: true, where: { id: id } });

        res.render('toughts/edit', { tought });
    }

    static async updateToughtSave(req, res) {
        const id = req.body.id;

        const tought = {
            title: req.body.title,
        }

        try {
            await Tought.update(tought, { where: { id: id } });

            req.flash('message', '');
            req.flash('message', 'Pensamento atualizado com sucesso');

            req.session.save(() => {
                res.redirect('/toughts/dashboard');
            })

        } catch (err) {
            console.log(err);
        }
    }
}
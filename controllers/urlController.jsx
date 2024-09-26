const Url = require('../models/Url');
const shortid = require('shortid');

exports.createShortUrl = async (req, res) => {
    const { originalUrl } = req.body;
    const shortUrl = shortid.generate();

    try {
        const url = new Url({
            originalUrl,
            shortUrl,
            user: req.user.id,
        });

        await url.save();

        res.status(201).json(url);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.getUrls = async (req, res) => {
    try {
        const urls = await Url.find({ user: req.user.id });
        res.json(urls);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};

exports.getUrl = async (req, res) => {
    try {
        const url = await Url.findOne({ shortUrl: req.params.shortUrl });

        if (!url) {
            return res.status(404).json({ message: 'No URL found' });
        }

        url.clicks += 1;
        await url.save();

        res.redirect(url.originalUrl);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};
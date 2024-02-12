module.exports = {
    '{apps,libs}/**/*.{ts,js,html,json,scss,css,md}': [
        'nx affected -t lint --parallel  --base=main --head=HEAD',
    ],
    '*.{ts,js,html,json,scss,css,md,yaml,yml}': [
        'nx format:write --base=main --head=HEAD',
    ],
};

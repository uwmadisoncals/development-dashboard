// Generated by CoffeeScript 1.3.1

/*
 ,__,    ,__,,__,  ,__,                   ,__,           ,__,      ,__,
 |  |    |__||  |_,|  |                   |  | ,__,      |  |_,    |__|
 |  |__, ,__,|  ,_||  |__, ,__, ,__, ,___,|  |/  /  ,__, |  ,_|    ,__, ,___,
 |  ,_, \|  ||  |  |  ,_, \|  | |  |/ ,__||  ,  /  / __ \|  |      |  |/  __|
 |  |_|  |  ||  |_,|  |_|  |  |_|  |  |__,|  |\  \|  ___/|  |_,,__,|  |\__  \
 |______/|__| \___||______/ \_____/ \____||__| \__|\____/ \___||__||  |_____/
 ,---------------------------------------------------------------|___/------,
 |  An intuitive JavaScript wrapper for the counterintuitive Bitbucket API  |
 '--------------------------------------------------------------------------'
                                            Copyright 2011, David Chambers
*/


(function() {
  var add_dates, alphabetical, bind, bitbucket, category, date_keys, decorate, del, get, handle, itemize, post, privileges_context, put, query, rename, select, strip_sizes, to_options, to_transformer, transform, transform_changeset, transform_issue, transform_issue_comment, transform_repository, traverse, unnest, url, _fn, _i, _len, _ref,
    __slice = [].slice,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  bitbucket = {};

  bind = function(ctx, fn) {
    return function() {
      var args;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return fn.apply(ctx, args);
    };
  };

  to_options = function(options, data) {
    if (options == null) {
      options = {};
    }
    if (typeof options === 'function') {
      options = {
        success: options
      };
    }
    if (data !== void 0) {
      options.data = data;
    }
    return options;
  };

  decorate = function(options, decorator) {
    var success;
    options = to_options(options);
    if (success = options.success) {
      options.success = function(data, status, xhr) {
        return success(decorator(data), status, xhr);
      };
    }
    return options;
  };

  traverse = function(data, path, fn) {
    var key, match, object, _i, _len;
    if (match = /^(.+?)[.](.+)$/.exec(path)) {
      traverse(data[match[1]], match[2], fn);
    } else if (match = /^\[(.+)\]$/.exec(path)) {
      path = match[1];
      for (_i = 0, _len = data.length; _i < _len; _i++) {
        object = data[_i];
        fn(object, path);
      }
    } else if (match = /^\{(.+)\}$/.exec(path)) {
      path = match[1];
      for (key in data) {
        if (!__hasProp.call(data, key)) continue;
        object = data[key];
        fn(object, path);
      }
    } else {
      fn(data, path);
    }
    return data;
  };

  transform = function(options, transformations) {
    var fn, path;
    options = to_options(options);
    for (path in transformations) {
      if (!__hasProp.call(transformations, path)) continue;
      fn = transformations[path];
      fn(path, options);
    }
    return options;
  };

  to_transformer = function(fn) {
    return function(path, options) {
      return decorate(options, function(data) {
        return traverse(data, path, fn);
      });
    };
  };

  date_keys = {
    utc_created_on: 'date_created',
    utc_last_updated: 'date_updated',
    utc_updated_on: 'date_updated'
  };

  add_dates = to_transformer(function(object, key_string) {
    var date_string, key, new_key, old_key, _i, _len, _ref, _ref1;
    _ref = key_string.split(',');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      key = _ref[_i];
      _ref1 = key.split(':'), old_key = _ref1[0], new_key = _ref1[1];
      if (date_string = object[old_key]) {
        new_key || (new_key = date_keys[old_key] || 'date');
        delete object[old_key];
        delete object[old_key.replace(/^utc_?/, '')];
        object[new_key] = new Date(date_string.replace(' ', 'T'));
      }
    }
    return object;
  });

  strip_sizes = to_transformer(function(object) {
    if (object.size === -1) {
      return delete object.size;
    }
  });

  alphabetical = function(a, b) {
    var aa, bb;
    if (a === b) {
      return 0;
    }
    aa = a.toLowerCase();
    bb = b.toLowerCase();
    if ((aa === bb ? a < b : aa < bb)) {
      return -1;
    } else {
      return 1;
    }
  };

  itemize = to_transformer(function(object, key) {
    var items, new_key, old_key, text, _ref;
    _ref = key.split(':'), old_key = _ref[0], new_key = _ref[1];
    if (old_key in object) {
      text = object[old_key].replace(/^\s+|\s+$/g, '');
      items = text ? text.split(/\s*[\n\r]\s*/).sort(alphabetical) : [];
      delete object[old_key];
      object[new_key || old_key] = items;
    }
    return object;
  });

  rename = to_transformer(function(object, key) {
    var new_key, old_key, value, _ref;
    _ref = key.split(':'), old_key = _ref[0], new_key = _ref[1];
    if (old_key in object) {
      value = object[old_key];
      delete object[old_key];
      object[new_key] = value;
    }
    return object;
  });

  unnest = to_transformer(function(object, key) {
    var nested_key, nested_keys, _i, _len, _ref, _ref1;
    _ref = key.split(':'), key = _ref[0], nested_keys = _ref[1];
    _ref1 = nested_keys.split(',');
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      nested_key = _ref1[_i];
      object[nested_key] = object[key][nested_key];
    }
    delete object[key];
    return object;
  });

  select = function(key, options) {
    return decorate(options, function(data) {
      return data[key];
    });
  };

  handle = function(type) {
    return function() {
      var data, options, url, _arg, _i;
      url = arguments[0], _arg = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), options = arguments[_i++];
      data = _arg[0];
      options = to_options(options, data);
      options.type = type;
      options.url = url;
      if (type === 'GET' && !bitbucket.proxy_url) {
        options.dataType = 'jsonp';
      }
      return $.ajax(options);
    };
  };

  post = handle('POST');

  get = handle('GET');

  put = handle('PUT');

  del = handle('DELETE');

  url = function() {
    var components, proxy_url;
    components = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    proxy_url = bitbucket.proxy_url;
    return (proxy_url || 'https://bitbucket.org/!api/1.0/') + components.join('/');
  };

  query = function(params) {
    var filters, key, keys, value, values, _i, _j, _len, _len1;
    if (params == null) {
      params = {};
    }
    keys = ((function() {
      var _results;
      _results = [];
      for (key in params) {
        if (!__hasProp.call(params, key)) continue;
        _results.push(key);
      }
      return _results;
    })()).sort();
    if (keys.length === 0) {
      return '';
    }
    filters = [];
    for (_i = 0, _len = keys.length; _i < _len; _i++) {
      key = keys[_i];
      values = params[key];
      if (!(values instanceof Array)) {
        values = [values];
      }
      for (_j = 0, _len1 = values.length; _j < _len1; _j++) {
        value = values[_j];
        filters.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      }
    }
    return '?' + filters.join('&');
  };

  bitbucket.error = (function(_super) {

    __extends(error, _super);

    error.name = 'error';

    function error(message) {
      if (!(this instanceof error)) {
        return new error(message);
      }
      this.name = 'bitbucket.error';
      this.message = message;
    }

    return error;

  })(Error);

  bitbucket.email_addresses = (function() {

    email_addresses.name = 'email_addresses';

    function email_addresses() {
      if (!(this instanceof email_addresses)) {
        return new email_addresses;
      }
    }

    email_addresses.prototype.url = function(address) {
      return url.apply(null, ['emails'].concat(__slice.call((address ? [address] : []))));
    };

    email_addresses.prototype.details = function() {
      var address, options, _arg, _i;
      _arg = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), options = arguments[_i++];
      address = _arg[0];
      return get(this.url(address), options);
    };

    email_addresses.prototype.add = function(address, options) {
      return put(this.url(address), options);
    };

    email_addresses.prototype.remove = function(address, options) {
      return del(this.url(address), options);
    };

    email_addresses.prototype.set_primary = function(address, options) {
      return post(this.url(address), {
        primary: true
      }, options);
    };

    return email_addresses;

  })();

  bitbucket.ssh_keys = (function() {

    ssh_keys.name = 'ssh_keys';

    function ssh_keys() {
      if (!(this instanceof ssh_keys)) {
        return new ssh_keys;
      }
    }

    ssh_keys.prototype.url = function(id) {
      return url.apply(null, ['ssh-keys'].concat(__slice.call((id ? [id] : []))));
    };

    ssh_keys.prototype.details = function() {
      var id, options, _arg, _i;
      _arg = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), options = arguments[_i++];
      id = _arg[0];
      return get(this.url(id), rename((id != null ? 'pk:id' : '[pk:id]'), options));
    };

    ssh_keys.prototype.add = function(attrs, options) {
      return post(this.url(), attrs, rename('pk:id', options));
    };

    ssh_keys.prototype.update = function(id, attrs, options) {
      return put(this.url(id), attrs, rename('pk:id', options));
    };

    ssh_keys.prototype.remove = function(id, options) {
      return del(this.url(id), options);
    };

    return ssh_keys;

  })();

  transform_issue = function(options, attrs, path) {
    var metadata_keys, transforms;
    if (path == null) {
      path = '%';
    }
    if (typeof attrs === 'string') {
      path = attrs;
      attrs = {};
    }
    metadata_keys = ['component', 'kind', 'milestone', 'version'];
    transforms = {};
    transforms[path.replace(/%/, 'utc_created_on,utc_last_updated')] = add_dates;
    transforms[path.replace(/%/, 'metadata:' + metadata_keys.join())] = unnest;
    return transform(to_options(options, attrs), transforms);
  };

  transform_issue_comment = function(options, attrs, path) {
    var transforms;
    if (path == null) {
      path = '%';
    }
    if (typeof attrs === 'string') {
      path = attrs;
      attrs = {};
    }
    transforms = {};
    transforms[path.replace(/%/, 'utc_created_on,utc_updated_on')] = add_dates;
    transforms[path.replace(/%/, 'author_info:author')] = rename;
    return transform(to_options(options, attrs), transforms);
  };

  transform_repository = function(options, attrs, path) {
    var transforms;
    if (path == null) {
      path = '%';
    }
    if (typeof attrs === 'string') {
      path = attrs;
      attrs = {};
    }
    if ((attrs != null ? attrs.mailing_lists : void 0) != null) {
      attrs.email_mailinglist = attrs.mailing_lists.join('\n');
      delete attrs.mailing_lists;
    }
    transforms = {};
    transforms[path.replace(/%/, 'utc_created_on,utc_last_updated')] = add_dates;
    transforms[path.replace(/%/, 'email_mailinglist:mailing_lists')] = itemize;
    return transform(to_options(options, attrs), transforms);
  };

  transform_changeset = function(options, path) {
    var transforms;
    if (path == null) {
      path = '%';
    }
    transforms = {};
    transforms[path.replace(/%/, 'utctimestamp')] = add_dates;
    transforms[path.replace(/%/, 'size')] = strip_sizes;
    return transform(to_options(options), transforms);
  };

  bitbucket.flags = {
    access: {
      direct: 0x1,
      via_groups: 0x2
    },
    output: {
      include_groups: 0x4
    }
  };

  privileges_context = (function() {
    var direct, expand, groups, label, level, max, to_label, to_level, _i, _len;
    to_label = ['read', 'write', 'admin'];
    to_level = {};
    for (level = _i = 0, _len = to_label.length; _i < _len; level = ++_i) {
      label = to_label[level];
      to_level[label] = level;
    }
    max = function() {
      var label, labels;
      labels = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return to_label[Math.max.apply(Math, (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = labels.length; _j < _len1; _j++) {
          label = labels[_j];
          _results.push(to_level[label] || 0);
        }
        return _results;
      })())];
    };
    direct = bitbucket.flags.access.direct;
    expand = bitbucket.flags.access.via_groups;
    groups = bitbucket.flags.output.include_groups;
    return function(flags) {
      return {
        direct: direct,
        expand: expand,
        flags: flags,
        groups: groups,
        max: max,
        privileges: {}
      };
    };
  })();

  bitbucket.repositories = function() {
    var options, params, _arg, _i;
    _arg = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), options = arguments[_i++];
    params = _arg[0];
    return get(url('repositories') + query(params), transform_repository(options, 'repositories.[%]'));
  };

  bitbucket.repository = (function() {

    repository.name = 'repository';

    repository.create = function(attrs, options) {
      var slug, username;
      username = attrs.username, slug = attrs.slug;
      if (!(username && slug)) {
        throw bitbucket.error('"username" and "slug" are required attributes');
      }
      if (/^[.]{1,2}$/.test(slug)) {
        throw bitbucket.error("\"" + slug + "\" is an invalid slug");
      }
      if (/[^a-z0-9.-]/.test(slug)) {
        throw bitbucket.error("\"" + slug + "\" does not match /^[a-z0-9.-]+$/");
      }
      delete attrs.username;
      delete attrs.slug;
      attrs.name = slug;
      post(url('repositories'), transform_repository(options, attrs));
      return repository(username, slug);
    };

    function repository(username, slug) {
      var _ref;
      if (slug == null) {
        _ref = username.split('/'), username = _ref[0], slug = _ref[1];
      }
      if (!(this instanceof repository)) {
        return new repository(username, slug);
      }
      this.username = username;
      this.slug = slug;
    }

    repository.prototype.toString = function() {
      return this.username + '/' + this.slug;
    };

    repository.prototype.url = function() {
      var components;
      components = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return url.apply(null, ['repositories', this.username, this.slug].concat(__slice.call(components)));
    };

    repository.prototype.details = function(options) {
      return get(this.url(), transform_repository(options));
    };

    repository.prototype.update = function(attrs, options) {
      return put(this.url(), transform_repository(options, attrs));
    };

    repository.prototype.destroy = function(options) {
      return del(this.url(), options);
    };

    repository.prototype.branches = function(options) {
      return get(this.url('branches'), transform(options, {
        '{utctimestamp}': add_dates,
        '{size}': strip_sizes
      }));
    };

    repository.prototype.changeset = function(rev, options) {
      return get(this.url('changesets', rev), transform_changeset(options));
    };

    repository.prototype.changesets = function() {
      var options, params, _arg, _i;
      _arg = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), options = arguments[_i++];
      params = _arg[0];
      return get(this.url('changesets') + query(params), transform_changeset(options, 'changesets.[%]'));
    };

    repository.prototype.diffstat = function(rev, options) {
      return get(this.url('changesets', rev, 'diffstat'), options);
    };

    repository.prototype.directory = function() {
      var options, path, rev, _i;
      rev = arguments[0], path = 3 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 1) : (_i = 1, []), options = arguments[_i++];
      return get(this.url('src', rev, path), transform(options, {
        'files.[utctimestamp]': add_dates
      }));
    };

    repository.prototype.file = function(rev, path, options) {
      return get(this.url('src', rev, path), select('data', options));
    };

    repository.prototype.followers = function(options) {
      return get(this.url('followers'), select('followers', options));
    };

    repository.prototype.create_issue = function(attrs, options) {
      return post(this.url('issues'), transform_issue(options, attrs));
    };

    repository.prototype.update_issue = function(id, attrs, options) {
      return put(this.url('issues', id), transform_issue(options, attrs));
    };

    repository.prototype.delete_issue = function(id, options) {
      return del(this.url('issues', id), options);
    };

    repository.prototype.issue = function(id, options) {
      return get(this.url('issues', id), transform_issue(options));
    };

    repository.prototype.create_issue_comment = function(id, attrs, options) {
      return post(this.url('issues', id, 'comments'), transform_issue_comment(options, attrs));
    };

    repository.prototype.update_issue_comment = function(id, comment_id, attrs, options) {
      return put(this.url('issues', id, 'comments', comment_id), transform_issue_comment(options, attrs));
    };

    repository.prototype.delete_issue_comment = function(id, comment_id, options) {
      return del(this.url('issues', id, 'comments', comment_id), options);
    };

    repository.prototype.issue_comment = function(id, comment_id, options) {
      return get(this.url('issues', id, 'comments', comment_id), transform_issue_comment(options));
    };

    repository.prototype.issue_comments = function(id, options) {
      return get(this.url('issues', id, 'comments'), transform_issue_comment(options, '[%]'));
    };

    repository.prototype.issue_followers = function(id, options) {
      return get(this.url('issues', id, 'followers'), select('followers', options));
    };

    repository.prototype.issues = function() {
      var options, params, _arg, _i;
      _arg = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), options = arguments[_i++];
      params = _arg[0];
      return get(this.url('issues') + query(params), transform_issue(options, 'issues.[%]'));
    };

    repository.prototype.privileges = function(flags, options) {
      var counter, ctx, error, replied, success, waiting;
      if (options == null) {
        options = flags;
        flags = 0x3;
      }
      options = to_options(options);
      success = options.success || function() {};
      error = options.error || function() {};
      ctx = privileges_context(flags);
      counter = 2;
      waiting = function() {
        return --counter > 0;
      };
      replied = false;
      options.error = function(xhr, status, text) {
        if (!replied) {
          error(xhr, status, text);
          return replied = true;
        }
      };
      options.success = bind(ctx, function(data, status, xhr) {
        var privilege, user, username, _i, _len, _ref;
        if (this.flags & this.direct) {
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            _ref = data[_i], privilege = _ref.privilege, user = _ref.user;
            username = user.username;
            this.privileges[username] = this.max(this.privileges[username], privilege);
          }
        }
        if (!waiting()) {
          return success(this.privileges, status, xhr);
        }
      });
      get(url('privileges', this), options);
      options.success = bind(ctx, function(data, status, xhr) {
        var group, privilege, username, _i, _j, _len, _len1, _ref, _ref1;
        if (this.flags & (this.groups | this.expand)) {
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            _ref = data[_i], privilege = _ref.privilege, group = _ref.group;
            if (this.flags & this.groups) {
              this.privileges[group.owner.username + '/' + group.slug] = privilege;
            }
            if (this.flags & this.expand) {
              _ref1 = group.members;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                username = _ref1[_j].username;
                this.privileges[username] = this.max(this.privileges[username], privilege);
              }
            }
          }
        }
        if (!waiting()) {
          return success(this.privileges, status, xhr);
        }
      });
      return get(url('group-privileges', this), options);
    };

    repository.prototype.tags = function(options) {
      return get(this.url('tags'), transform(options, {
        '{utctimestamp}': add_dates,
        '{size}': strip_sizes
      }));
    };

    repository.prototype.wiki_page = function() {
      var options, title, _arg, _i;
      _arg = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), options = arguments[_i++];
      title = _arg[0];
      return get(this.url('wiki', title), options);
    };

    return repository;

  })();

  _ref = ['component', 'milestone', 'version'];
  _fn = function() {
    var all, one, prototype;
    one = category;
    all = category + 's';
    prototype = bitbucket.repository.prototype;
    prototype['create_' + one] = function(name, options) {
      return post(this.url('issues', all), {
        name: name
      }, options);
    };
    prototype['update_' + one] = function(id, name, options) {
      return put(this.url('issues', all, id), {
        name: name
      }, options);
    };
    prototype['delete_' + one] = function(id, options) {
      return del(this.url('issues', all, id), options);
    };
    prototype[one] = function(id, options) {
      return get(this.url('issues', all, id), options);
    };
    return prototype[all] = function(options) {
      return get(this.url('issues', all), options);
    };
  };
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    category = _ref[_i];
    _fn();
  }

  bitbucket.send_invitation = function(address, access, repository, options) {
    var invitation_url, slug, username, _ref1;
    _ref1 = repository.toString().split('/'), username = _ref1[0], slug = _ref1[1];
    invitation_url = url('invitations', username, slug, address);
    return post(invitation_url, {
      permission: access
    }, add_dates('utc_sent_on', transform_repository(options, 'repository.%')));
  };

  bitbucket.user = (function() {

    user.name = 'user';

    user.create = function(attrs, options) {
      var username;
      username = attrs.username;
      if (!username) {
        throw bitbucket.error('"username" is a required attribute');
      }
      post(url('newuser'), attrs, options);
      return user(username);
    };

    function user(username) {
      if (!(this instanceof user)) {
        return new user(username);
      }
      this.username = username;
    }

    user.prototype.url = function() {
      var components;
      components = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return url.apply(null, ['users', this.username].concat(__slice.call(components)));
    };

    user.prototype.details = function(options) {
      return get(this.url(), select('user', options));
    };

    user.prototype.events = function() {
      var options, params, _arg, _j;
      _arg = 2 <= arguments.length ? __slice.call(arguments, 0, _j = arguments.length - 1) : (_j = 0, []), options = arguments[_j++];
      params = _arg[0];
      return get(this.url('events') + query(params), transform(options, {
        'events.[utc_created_on:date]': add_dates
      }));
    };

    user.prototype.followers = function(options) {
      return get(this.url('followers'), select('followers', options));
    };

    user.prototype.privileges = function(flags, options) {
      var counter, ctx, error, replied, success, waiting;
      if (options == null) {
        options = flags;
        flags = 0x3;
      }
      options = to_options(options);
      success = options.success || function() {};
      error = options.error || function() {};
      ctx = privileges_context(flags);
      counter = 2;
      waiting = function() {
        return --counter > 0;
      };
      replied = false;
      options.error = function(xhr, status, text) {
        if (!replied) {
          error(xhr, status, text);
          return replied = true;
        }
      };
      options.success = bind(ctx, function(data, status, xhr) {
        var privilege, repo, user, _base, _j, _len1, _ref1;
        if (this.flags & this.direct) {
          for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
            _ref1 = data[_j], privilege = _ref1.privilege, repo = _ref1.repo, user = _ref1.user;
            repo = (_base = this.privileges)[repo] || (_base[repo] = {});
            repo[user.username] = this.max(repo[user.username], privilege);
          }
        }
        if (!waiting()) {
          return success(this.privileges, status, xhr);
        }
      });
      get(url('privileges', this.username), options);
      options.success = bind(ctx, function(data, status, xhr) {
        var group, privilege, repo, username, _base, _j, _k, _len1, _len2, _ref1, _ref2;
        if (this.flags & (this.groups | this.expand)) {
          for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
            _ref1 = data[_j], privilege = _ref1.privilege, repo = _ref1.repo, group = _ref1.group;
            repo = (_base = this.privileges)[repo] || (_base[repo] = {});
            if (this.flags & this.groups) {
              repo[group.owner.username + '/' + group.slug] = privilege;
            }
            if (this.flags & this.expand) {
              _ref2 = group.members;
              for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                username = _ref2[_k].username;
                repo[username] = this.max(repo[username], privilege);
              }
            }
          }
        }
        if (!waiting()) {
          return success(this.privileges, status, xhr);
        }
      });
      return get(url('group-privileges', this.username), options);
    };

    user.prototype.repositories = function(options) {
      return get(this.url(), select('repositories', transform_repository(options, '[%]')));
    };

    return user;

  })();

  bitbucket.utils = {
    alphabetical: alphabetical
  };

  window.bitbucket = bitbucket;

}).call(this);
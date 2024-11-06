# using redis-py to test redis
import redis

r = redis.StrictRedis(host='localhost', port=6379, db=0)
r.set('foo', 'bar')
value = r.get('foo')
print(value)
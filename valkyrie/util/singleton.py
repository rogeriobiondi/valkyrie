# This file is used to create a singleton class in python
# This is a decorator function that takes a class and returns
# a function that checks if the class has already been instantiated
# If it has, it returns the instance, otherwise it creates a new instance
# and returns it
def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance